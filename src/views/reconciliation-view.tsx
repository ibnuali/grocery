import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Effect } from "effect";
import { Modal } from "../components/ui/modal";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ItemAutocomplete } from "../components/ui/item-autocomplete";
import {
  ReconciliationService,
  type PlannedItemReconcile,
  type UnplannedItemReconcile,
} from "../services/reconciliation-service";
import type { PlanItem, ShoppingPlan } from "../domain/plan.schema";
import type { MasterItem } from "../domain/catalog.schema";
import {
  Plus,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  MinusCircle,
  Check,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "../i18n/format";

interface UnplannedItemWithKey extends UnplannedItemReconcile {
  _key: string;
}
export interface ReconciliationViewProps {
  plan: ShoppingPlan;
  onSuccess: (updatedPlan: ShoppingPlan) => void;
  onBack: () => void;
}
interface PlannedFormState {
  [id: string]: { actual_price: string; is_skipped: boolean };
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({
  plan,
  onSuccess,
  onBack,
}) => {
  const { t } = useTranslation();
  const [plannedState, setPlannedState] = useState<PlannedFormState>(() => {
    const initial: PlannedFormState = {};
    plan.items?.forEach((item: PlanItem) => {
      initial[item.id] = { actual_price: "", is_skipped: false };
    });
    return initial;
  });
  const [unplannedItems, setUnplannedItems] = useState<UnplannedItemWithKey[]>(
    [],
  );
  const [isAddUnplannedOpen, setIsAddUnplannedOpen] = useState(false);
  const [unplannedName, setUnplannedName] = useState("");
  const [unplannedCategory, setUnplannedCategory] = useState("General");
  const [unplannedQty, setUnplannedQty] = useState("1");
  const [unplannedUnit, setUnplannedUnit] = useState("pcs");
  const [unplannedPrice, setUnplannedPrice] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePriceChange = (id: string, price: string) =>
    setPlannedState((prev) => ({
      ...prev,
      [id]: { ...prev[id], actual_price: price },
    }));
  const handleToggleSkip = (id: string) =>
    setPlannedState((prev) => ({
      ...prev,
      [id]: { ...prev[id], is_skipped: !prev[id].is_skipped },
    }));
  const handleAddUnplannedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unplannedName.trim()) return;
    setUnplannedItems((prev) => [
      ...prev,
      {
        _key: crypto.randomUUID(),
        item_name: unplannedName.trim(),
        category: unplannedCategory.trim() || "General",
        qty: Number(unplannedQty) || 1,
        unit: unplannedUnit.trim() || "pcs",
        actual_price: unplannedPrice.trim() || "0",
      },
    ]);
    setIsAddUnplannedOpen(false);
    setUnplannedName("");
    setUnplannedQty("1");
    setUnplannedUnit("pcs");
    setUnplannedPrice("0");
  };

  const totalEstimated =
    plan.items?.reduce(
      (acc, item) =>
        plannedState[item.id]?.is_skipped
          ? acc
          : acc + Number(item.qty) * Number(item.estimated_price),
      0,
    ) ?? 0;
  const plannedActualTotal =
    plan.items?.reduce((acc, item) => {
      const state = plannedState[item.id];
      return state?.is_skipped
        ? acc
        : acc + Number(item.qty) * (Number(state?.actual_price) || 0);
    }, 0) ?? 0;
  const unplannedActualTotal = unplannedItems.reduce(
    (acc, item) => acc + Number(item.qty) * Number(item.actual_price),
    0,
  );
  const grandTotalActual = plannedActualTotal + unplannedActualTotal;
  const variance = grandTotalActual - totalEstimated;

  const handleSubmitReconciliation = async () => {
    setSubmitting(true);
    setError(null);
    const plannedPayload: PlannedItemReconcile[] = Object.entries(
      plannedState,
    ).map(([id, val]) => ({
      id,
      actual_price: val.actual_price.trim() || "0",
      is_skipped: val.is_skipped,
    }));
    const prog = ReconciliationService.reconcile(
      plan.id,
      plannedPayload,
      unplannedItems.map(({ _key, ...rest }) => rest),
    ).pipe(
      Effect.map((updatedPlan) => onSuccess(updatedPlan)),
      Effect.catchAll((err) => {
        setError(
          err instanceof Error ? err.message : t("reconciliation.errorSave"),
        );
        return Effect.succeed(undefined);
      }),
    );
    await Effect.runPromise(prog);
    setSubmitting(false);
  };

  return (
    <div className="reconciliation-page">
      <header className="reconciliation-header">
        <button type="button" onClick={onBack} className="reconciliation-back">
          <ArrowLeft aria-hidden="true" />
          <span>{t("reconciliation.back")}</span>
        </button>
      </header>

      <section className="reconciliation-intro">
        <div className="reconciliation-intro__title">
          <div>
            <h1>{t("reconciliation.title")}</h1>
            <p>{plan.title}</p>
          </div>
        </div>
        <div
          className="reconciliation-summary"
          aria-label={t("reconciliation.title")}
        >
          <div className="reconciliation-stat">
            <span>{t("reconciliation.initialEstimate")}</span>
            <strong>{formatCurrency(totalEstimated)}</strong>
          </div>
          <div className="reconciliation-stat reconciliation-stat--actual">
            <span>{t("reconciliation.actualTotal")}</span>
            <strong>{formatCurrency(grandTotalActual)}</strong>
          </div>
          <div
            className={`reconciliation-stat ${variance > 0 ? "reconciliation-stat--over" : "reconciliation-stat--under"}`}
          >
            <span>{t("reconciliation.variance")}</span>
            <strong>
              {variance > 0 ? (
                <>
                  <TrendingUp aria-hidden="true" />+{formatCurrency(variance)}
                </>
              ) : (
                <>
                  <TrendingDown aria-hidden="true" />-
                  {formatCurrency(Math.abs(variance))}
                </>
              )}
            </strong>
          </div>
        </div>
      </section>

      {error && (
        <div className="reconciliation-error" role="alert">
          {error}
        </div>
      )}

      <div className="reconciliation-layout">
        <main className="reconciliation-main">
          <div className="reconciliation-section-heading">
            <div>
              <h2>{t("reconciliation.plannedItems")}</h2>
            </div>
            <span>{plan.items?.length ?? 0}</span>
          </div>
          <div className="reconciliation-list">
            {plan.items?.map((item: PlanItem) => {
              const isSkipped = plannedState[item.id]?.is_skipped;
              const actualPrice =
                Number(plannedState[item.id]?.actual_price) || 0;
              const estimatedSubtotal =
                Number(item.qty) * Number(item.estimated_price);
              const actualSubtotal = Number(item.qty) * actualPrice;
              const diff = actualSubtotal - estimatedSubtotal;
              return (
                <article
                  key={item.id}
                  className={`reconciliation-item ${isSkipped ? "is-skipped" : ""}`}
                >
                  <div className="reconciliation-item__details">
                    <div className="reconciliation-item__name">
                      {item.item_name}
                      {isSkipped && <span>{t("reconciliation.skip")}</span>}
                    </div>
                    <p>
                      {Number(item.qty)} {item.unit} ·{" "}
                      {t("reconciliation.initialEstimate")}:{" "}
                      {formatCurrency(Number(item.estimated_price))}
                    </p>
                  </div>
                  <div className="reconciliation-item__controls">
                    {!isSkipped && (
                      <div className="reconciliation-price">
                        <Input
                          aria-label={`${item.item_name} ${t("reconciliation.actualPricePlaceholder")}`}
                          type="number"
                          min="0"
                          step="any"
                          value={plannedState[item.id]?.actual_price ?? ""}
                          onChange={(e) =>
                            handlePriceChange(item.id, e.target.value)
                          }
                          placeholder={t(
                            "reconciliation.actualPricePlaceholder",
                          )}
                        />
                        <div>
                          <strong>{formatCurrency(actualSubtotal)}</strong>
                          {diff !== 0 && (
                            <small
                              className={diff > 0 ? "is-over" : "is-under"}
                            >
                              {diff > 0 ? "+" : "-"}
                              {formatCurrency(Math.abs(diff))}
                            </small>
                          )}
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleSkip(item.id)}
                      className="reconciliation-skip"
                    >
                      <MinusCircle aria-hidden="true" />
                      <span>
                        {isSkipped
                          ? t("reconciliation.activate")
                          : t("reconciliation.skip")}
                      </span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </main>

        <aside className="reconciliation-aside">
          <div className="reconciliation-section-heading reconciliation-aside__heading">
            <div>
              <h2>{t("reconciliation.unplannedItems")}</h2>
            </div>
            <span>{unplannedItems.length}</span>
            <Button
              className="reconciliation-aside__add"
              size="sm"
              variant="outline"
              aria-label={t("common.addItem")}
              onClick={() => setIsAddUnplannedOpen(true)}
            >
              <Plus aria-hidden="true" />
            </Button>
          </div>
          {unplannedItems.length > 0 && (
            <div className="reconciliation-unplanned-list">
              {unplannedItems.map((u) => (
                <article key={u._key} className="reconciliation-unplanned">
                  <div>
                    <strong>{u.item_name}</strong>
                    <span>{t("common.unplanned")}</span>
                    <p>
                      {u.qty} {u.unit} ×{" "}
                      {formatCurrency(Number(u.actual_price))}
                    </p>
                  </div>
                  <div className="reconciliation-unplanned__aside">
                    <strong>
                      {formatCurrency(Number(u.qty) * Number(u.actual_price))}
                    </strong>
                    <button
                      type="button"
                      onClick={() =>
                        setUnplannedItems((prev) =>
                          prev.filter((item) => item._key !== u._key),
                        )
                      }
                      aria-label={`${t("common.delete")} ${u.item_name}`}
                    >
                      <Trash2 aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </aside>
      </div>

      <div className="reconciliation-action-bar">
        <div>
          <span>{t("reconciliation.finalTotal")}</span>
          <strong>{formatCurrency(grandTotalActual)}</strong>
        </div>
        <div>
          <Button variant="outline" onClick={onBack}>
            {t("reconciliation.cancel")}
          </Button>
          <Button onClick={handleSubmitReconciliation} disabled={submitting}>
            <Check aria-hidden="true" />
            <span>
              {submitting
                ? t("reconciliation.saving")
                : t("reconciliation.saveButton")}
            </span>
          </Button>
        </div>
      </div>

      <Modal
        open={isAddUnplannedOpen}
        onOpenChange={setIsAddUnplannedOpen}
        title={t("reconciliation.modalTitle")}
        description={t("reconciliation.modalDesc")}
      >
        <form
          onSubmit={handleAddUnplannedSubmit}
          className="reconciliation-modal-form"
        >
          <div>
            <label>{t("common.itemName")}</label>
            <ItemAutocomplete
              value={unplannedName}
              onChange={(name: string, master?: MasterItem) => {
                setUnplannedName(name);
                if (master) {
                  setUnplannedPrice(String(master.latest_price));
                  if (master.category) setUnplannedCategory(master.category);
                }
              }}
            />
          </div>
          <div className="reconciliation-modal-form__row">
            <Input
              label={t("common.qty")}
              type="number"
              min="0.1"
              step="any"
              value={unplannedQty}
              onChange={(e) => setUnplannedQty(e.target.value)}
              required
            />
            <Input
              label={t("common.unit")}
              placeholder={t("common.unitPlaceholder")}
              value={unplannedUnit}
              onChange={(e) => setUnplannedUnit(e.target.value)}
              required
            />
          </div>
          <Input
            label={t("reconciliation.actualPriceLabel")}
            type="number"
            min="0"
            step="any"
            value={unplannedPrice}
            onChange={(e) => setUnplannedPrice(e.target.value)}
            required
          />
          <div className="reconciliation-modal-form__actions">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddUnplannedOpen(false)}
            >
              {t("reconciliation.cancel")}
            </Button>
            <Button type="submit" size="sm">
              {t("reconciliation.addButton")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
