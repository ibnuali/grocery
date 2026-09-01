import React, { useState } from "react";
import { Modal } from "../components/ui/modal";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { BudgetBar } from "../components/ui/budget-bar";
import { ItemAutocomplete } from "../components/ui/item-autocomplete";
import { Plus, Trash2, ShoppingBag, ArrowRight, Info } from "lucide-react";
import type { MasterItem } from "../domain/catalog.schema";
import type { PlanItem } from "../domain/plan.schema";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../i18n/format";

export const PlanDetailSkeleton: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div
      className="plan-detail-skeleton"
      role="status"
      aria-live="polite"
      aria-label={t("common.loading")}
    >
      <span className="sr-only">{t("common.loading")}</span>
      <section className="plan-detail-skeleton__overview">
        <div className="plan-detail-skeleton__heading">
          <span className="skeleton-block skeleton-block--title" />
        </div>
        <div className="plan-detail-skeleton__actions">
          <span className="skeleton-block skeleton-block--button skeleton-block--button-wide" />
          <span className="skeleton-block skeleton-block--button" />
        </div>
      </section>
      <section className="plan-detail-skeleton__budget">
        <div className="plan-detail-skeleton__summary">
          <span className="skeleton-block skeleton-block--summary" />
          <span className="skeleton-block skeleton-block--summary" />
        </div>
        <span className="skeleton-block skeleton-block--bar" />
        <span className="skeleton-block skeleton-block--status" />
      </section>
      <div className="plan-detail-skeleton__items-heading">
        <span className="skeleton-block skeleton-block--section-title" />
        <span className="skeleton-block skeleton-block--button" />
      </div>
      <div className="plan-detail-skeleton__items">
        <span className="skeleton-block skeleton-block--item" />
        <span className="skeleton-block skeleton-block--item" />
        <span className="skeleton-block skeleton-block--item" />
      </div>
    </div>
  );
};

export interface PlanDetailViewProps {
  planTitle: string;
  planStatus: string;
  budgetTarget: number;
  items: readonly PlanItem[];
  canReconcile: boolean;
  onAddItem: (item: {
    itemName: string;
    qty: number;
    unit: string;
    estimatedPrice: number;
    category: string;
  }) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onStartShopping: () => void;
  onReconcile: () => void;
}

export const PlanDetailView: React.FC<PlanDetailViewProps> = ({
  planTitle,
  planStatus,
  budgetTarget,
  items,
  canReconcile,
  onAddItem,
  onDeleteItem,
  onStartShopping,
  onReconcile,
}) => {
  const { t } = useTranslation();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("General");
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState("pcs");
  const [estimatedPrice, setEstimatedPrice] = useState("0");
  const [submitting, setSubmitting] = useState(false);

  const handleAutocompleteChange = (name: string, master?: MasterItem) => {
    setItemName(name);
    if (master) {
      setEstimatedPrice(String(master.latest_price));
      if (master.category) setCategory(master.category);
    }
  };

  const handleFormSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!itemName.trim()) return;
    setSubmitting(true);
    await onAddItem({
      itemName: itemName.trim(),
      category: category.trim() || "General",
      qty: Number(qty) || 1,
      unit: unit.trim() || "pcs",
      estimatedPrice: Number(estimatedPrice) || 0,
    });
    setSubmitting(false);
    setIsAddOpen(false);
    setItemName("");
    setQty("1");
    setUnit("pcs");
    setEstimatedPrice("0");
  };

  const totalEstimated = items.reduce(
    (acc, item) => acc + Number(item.qty) * Number(item.estimated_price),
    0,
  );

  return (
    <div className="plan-detail-page">
      <section
        className="plan-detail-overview"
        aria-labelledby="plan-detail-title"
      >
        <div className="plan-detail-overview__heading">
          <div className="plan-detail-overview__copy">
            <h1 id="plan-detail-title">{planTitle}</h1>
          </div>
        </div>

        <div className="plan-detail-overview__actions">
          <Button
            className="plan-detail-overview__start"
            onClick={onStartShopping}
            disabled={planStatus === "COMPLETED"}
          >
            <span>{t("planDetail.startShopping")}</span>
            <ArrowRight aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            onClick={onReconcile}
            disabled={!canReconcile}
            aria-describedby={
              !canReconcile ? "plan-detail-reconcile-help" : undefined
            }
          >
            {t("planDetail.reconcile")}
          </Button>
        </div>
        {!canReconcile && (
          <p
            className="plan-detail-overview__hint"
            id="plan-detail-reconcile-help"
          >
            <Info aria-hidden="true" />
            <span>{t("planDetail.reconcileUnavailable")}</span>
          </p>
        )}
      </section>

      <BudgetBar
        className="plan-detail-budget"
        totalEstimated={totalEstimated}
        budgetTarget={budgetTarget}
      />

      <section
        className="plan-detail-page__items"
        aria-labelledby="plan-detail-items-title"
      >
        <div className="plan-detail-page__items-heading">
          <div className="plan-detail-page__items-heading-copy">
            <h2 id="plan-detail-items-title">{t("planDetail.itemList")}</h2>
            <span className="plan-detail-page__item-count">
              {t("planDetail.itemCount", { count: items.length })}
            </span>
          </div>
          <Button
            className="plan-detail-add-item"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            disabled={planStatus === "COMPLETED"}
          >
            <Plus aria-hidden="true" />
            <span>{t("common.addItem")}</span>
          </Button>
        </div>
        {items.length === 0 ? (
          <div className="plan-detail-empty">
            <div className="plan-detail-empty__icon" aria-hidden="true">
              <ShoppingBag />
            </div>
            <div>
              <p className="plan-detail-empty__title">
                {t("planDetail.emptyTitle")}
              </p>
              <p className="plan-detail-empty__description">
                {t("planDetail.emptyDesc")}
              </p>
            </div>
            <Button
              className="plan-detail-empty__action"
              variant="outline"
              size="sm"
              onClick={() => setIsAddOpen(true)}
              disabled={planStatus === "COMPLETED"}
            >
              <Plus aria-hidden="true" />
              <span>{t("planDetail.addFirstItem")}</span>
            </Button>
          </div>
        ) : (
          <ul className="plan-detail-page__items-list">
            {items.map((item) => {
              const subtotal = Number(item.qty) * Number(item.estimated_price);
              return (
                <li key={item.id} className="plan-detail-item">
                  <div className="plan-detail-item__details">
                    <h3>{item.item_name}</h3>
                    <p>
                      <span>
                        {Number(item.qty)} {item.unit}
                      </span>
                      <span aria-hidden="true">×</span>
                      <span>
                        {formatCurrency(Number(item.estimated_price))}
                      </span>
                    </p>
                  </div>
                  <div className="plan-detail-item__aside">
                    <div className="plan-detail-item__subtotal">
                      <span>{t("common.subtotal")}</span>
                      <strong>{formatCurrency(subtotal)}</strong>
                    </div>
                    {planStatus !== "COMPLETED" && (
                      <button
                        className="plan-detail-item__delete"
                        type="button"
                        aria-label={`${t("common.delete")} ${item.item_name}`}
                        onClick={() => onDeleteItem(item.id)}
                      >
                        <Trash2 aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Modal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title={t("planDetail.modalTitle")}
        description={t("planDetail.modalDesc")}
      >
        <form onSubmit={handleFormSubmit} className="plan-detail-form">
          <div className="plan-detail-form__field">
            <label>{t("common.itemName")}</label>
            <ItemAutocomplete
              value={itemName}
              onChange={handleAutocompleteChange}
            />
          </div>
          <div className="plan-detail-form__row">
            <Input
              label={t("planDetail.qtyLabel")}
              type="number"
              min="0.1"
              step="any"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
            />
            <Input
              label={t("planDetail.unitLabel")}
              placeholder={t("planDetail.unitPlaceholder")}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            />
          </div>
          <Input
            label={t("planDetail.priceLabel")}
            type="number"
            min="0"
            step="any"
            value={estimatedPrice}
            onChange={(e) => setEstimatedPrice(e.target.value)}
            required
          />
          <div className="plan-detail-form__subtotal">
            <span>{t("planDetail.subtotalEstimate")}</span>
            <strong>
              {formatCurrency(Number(qty) * Number(estimatedPrice))}
            </strong>
          </div>
          <div className="plan-detail-form__actions">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? t("common.saving") : t("planDetail.addButton")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
