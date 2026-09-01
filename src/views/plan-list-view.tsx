import React, { useState, useEffect, useRef, useCallback } from "react";
import { Effect } from "effect";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { PlanService } from "../services/plan-service";
import { useToast } from "../hooks/use-toast";
import { Modal } from "../components/ui/modal";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import type { ShoppingPlan } from "../domain/plan.schema";
import { Plus, Calendar, ShoppingBag, MoreVertical } from "lucide-react";
import { isCreatePlanRequest } from "../lib/mobile-navigation";
import { formatCurrency } from "../i18n/format";
import { PageHeader } from "../components/page-header";

export const PlanListSkeleton: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div
      className="plan-list-skeleton"
      role="status"
      aria-live="polite"
      aria-label={t("planList.loading")}
    >
      <span className="sr-only">{t("planList.loading")}</span>
      <div className="plan-list-skeleton__cards">
        <span className="skeleton-block skeleton-block--plan-card" />
        <span className="skeleton-block skeleton-block--plan-card" />
        <span className="skeleton-block skeleton-block--plan-card" />
      </div>
    </div>
  );
};

export interface PlanListViewProps {
  onSelectPlan: (planId: string) => void;
  onLogout: () => void;
}

export const PlanListView: React.FC<PlanListViewProps> = ({ onSelectPlan }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [plans, setPlans] = useState<readonly ShoppingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [budgetTarget, setBudgetTarget] = useState("1500000");
  const [shoppingDate, setShoppingDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [creating, setCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ShoppingPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<ShoppingPlan | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);
  const loadingRef = useRef(false);
  const nextCursorRef = useRef<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCreatePlanRequest(location.search)) return;
    setIsCreateOpen(true);
    navigate(location.pathname, { replace: true });
  }, [location.pathname, location.search, navigate]);

  const loadPlans = useCallback(
    async (cursor?: string) => {
      const isInitial = cursor === undefined;
      if (loadingRef.current || (!isInitial && !cursor)) return;

      loadingRef.current = true;
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const prog = PlanService.listPlans(cursor, 20).pipe(
        Effect.map(({ items, next_cursor }) => {
          if (isInitial) {
            setPlans(items);
          } else {
            setPlans((previous) => {
              const existingIds = new Set(previous.map((plan) => plan.id));
              return [
                ...previous,
                ...items.filter((plan) => !existingIds.has(plan.id)),
              ];
            });
          }
          nextCursorRef.current = next_cursor;
          setNextCursor(next_cursor);
          setHasMore(next_cursor !== null);
        }),
        Effect.catchAll(() => {
          toast(t("planList.errorLoad"), "error");
          if (isInitial) setPlans([]);
          return Effect.succeed(undefined);
        }),
      );

      try {
        await Effect.runPromise(prog);
      } finally {
        loadingRef.current = false;
        if (isInitial) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [t, toast],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPlans();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadPlans]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || loading || !hasMore || nextCursor === null) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        const cursor = nextCursorRef.current;
        if (cursor) void loadPlans(cursor);
      },
      { rootMargin: "320px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, nextCursor, loadPlans]);

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !title.trim()) return;
    setSavingPlan(true);
    const prog = PlanService.updatePlan(
      editingPlan.id,
      title.trim(),
      Number(budgetTarget) || 0,
      shoppingDate,
    ).pipe(
      Effect.map((updatedPlan) => {
        setPlans((previous) =>
          previous.map((plan) =>
            plan.id === updatedPlan.id ? updatedPlan : plan,
          ),
        );
        setEditingPlan(null);
        setSavingPlan(false);
      }),
      Effect.catchAll(() => {
        setSavingPlan(false);
        toast(t("planList.errorUpdate"), "error");
        return Effect.succeed(undefined);
      }),
    );
    await Effect.runPromise(prog);
  };

  const handleDelete = async () => {
    if (!deletingPlan) return;
    setSavingPlan(true);
    const prog = PlanService.deletePlan(deletingPlan.id).pipe(
      Effect.map(() => {
        setPlans((previous) =>
          previous.filter((plan) => plan.id !== deletingPlan.id),
        );
        setDeletingPlan(null);
        setSavingPlan(false);
      }),
      Effect.catchAll(() => {
        setSavingPlan(false);
        toast(t("planList.errorDelete"), "error");
        return Effect.succeed(undefined);
      }),
    );
    await Effect.runPromise(prog);
  };

  const openEdit = (plan: ShoppingPlan) => {
    setEditingPlan(plan);
    setTitle(plan.title);
    setBudgetTarget(String(plan.budget_target));
    setShoppingDate(plan.shopping_date.substring(0, 10));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    const prog = PlanService.createPlan(
      title.trim(),
      Number(budgetTarget) || 0,
      shoppingDate,
    ).pipe(
      Effect.map((newPlan) => {
        setIsCreateOpen(false);
        setTitle("");
        setCreating(false);
        onSelectPlan(newPlan.id);
      }),
      Effect.catchAll(() => {
        setCreating(false);
        toast(t("planList.errorCreate"), "error");
        return Effect.succeed(undefined);
      }),
    );
    await Effect.runPromise(prog);
  };

  const cardBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    borderRadius: "var(--radius-card)",
    background: "var(--color-paper)",
    padding: "1.25rem",
    border: "1.5px solid var(--color-rule)",
    cursor: "pointer",
    transition:
      "transform 220ms var(--ease-out), box-shadow 220ms var(--ease-out), border-color 220ms var(--ease-out)",
    boxShadow: "0 2px 8px -4px oklch(20% 0.012 250 / 0.06)",
  };

  return (
    <div
      className="plan-list-page"
      style={{
        maxWidth: "40rem",
        margin: "0 auto",
        padding: "2rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <PageHeader
        title={t("planList.title")}
        subtitle={t("planList.subtitle")}
        action={
          <div
            className="plan-list-create-action"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus style={{ height: "1rem", width: "1rem" }} />
              <span>{t("planList.createPlan")}</span>
            </Button>
          </div>
        }
      />

      {loading ? (
        <PlanListSkeleton />
      ) : plans.length === 0 ? (
        <div
          style={{
            borderRadius: "var(--radius-card)",
            border: "2px dashed var(--color-rule)",
            background: "var(--color-paper)",
            padding: "2.5rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              display: "flex",
              height: "3rem",
              width: "3rem",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "14px",
              background:
                "color-mix(in oklch, var(--color-accent) 20%, transparent)",
              color: "var(--color-accent-deep)",
            }}
          >
            <ShoppingBag style={{ height: "1.5rem", width: "1.5rem" }} />
          </div>
          <div>
            <h3
              style={{
                fontSize: "var(--text-base)",
                fontWeight: 700,
                color: "var(--color-ink)",
                fontFamily: "var(--font-display)",
              }}
            >
              {t("planList.emptyTitle")}
            </h3>
            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-ink-3)",
                maxWidth: "20rem",
                margin: "0.25rem auto 0",
                fontFamily: "var(--font-body)",
                lineHeight: 1.5,
              }}
            >
              {t("planList.emptyDesc")}
            </p>
          </div>
          <Button
            className="plan-list-create-empty-action"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            style={{ marginTop: "0.5rem" }}
          >
            <Plus style={{ height: "1rem", width: "1rem" }} />
            <span>{t("planList.createFirst")}</span>
          </Button>
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {plans.map((p) => {
            const isCompleted = p.status === "COMPLETED";
            return (
              <div key={p.id} style={{ position: "relative" }}>
                <div
                  onClick={() => onSelectPlan(p.id)}
                  style={{ ...cardBase, position: "relative" }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "var(--text-base)",
                          fontWeight: 700,
                          color: "var(--color-ink)",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {p.title}
                      </span>
                      <span
                        style={{
                          borderRadius: "var(--radius-pill)",
                          padding: "0.125rem 0.5rem",
                          fontSize: "0.625rem",
                          fontWeight: 700,
                          fontFamily: "var(--font-body)",
                          background: isCompleted
                            ? "color-mix(in oklch, var(--color-mint) 20%, transparent)"
                            : "color-mix(in oklch, var(--color-accent) 30%, transparent)",
                          color: isCompleted
                            ? "var(--color-mint)"
                            : "var(--color-accent-deep)",
                        }}
                      >
                        {isCompleted
                          ? t("planList.statusCompleted")
                          : t("planList.statusPlanning")}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        fontSize: "var(--text-xs)",
                        color: "var(--color-ink-3)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <Calendar
                          style={{ height: "0.875rem", width: "0.875rem" }}
                        />
                        {p.shopping_date
                          ? p.shopping_date.substring(0, 10)
                          : "-"}
                      </span>
                      <span style={{ color: "var(--color-rule)" }}>•</span>
                      <span>
                        {t("planList.target")}{" "}
                        <strong
                          style={{
                            color: "var(--color-ink)",
                            fontFamily: "var(--font-mono)",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {formatCurrency(Number(p.budget_target))}
                        </strong>
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label={t("planList.menuLabel")}
                      onClick={(event) => event.stopPropagation()}
                      render={<button type="button" />}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        width: "2.25rem",
                        height: "2.25rem",
                        margin: "-0.5rem -0.5rem -0.5rem 0",
                        border: 0,
                        borderRadius: "var(--radius-pill)",
                        background: "transparent",
                        color: "var(--color-ink-3)",
                        cursor: "pointer",
                      }}
                    >
                      <MoreVertical
                        style={{ height: "1.25rem", width: "1.25rem" }}
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={(event) => {
                          event.stopPropagation();
                          openEdit(p);
                        }}
                      >
                        {t("planList.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={(event) => {
                          event.stopPropagation();
                          setDeletingPlan(p);
                        }}
                      >
                        {t("common.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
          {hasMore && (
            <div
              ref={sentinelRef}
              aria-hidden="true"
              style={{ height: "1px" }}
            />
          )}
          {loadingMore && (
            <div
              role="status"
              aria-live="polite"
              style={{
                textAlign: "center",
                color: "var(--color-ink-3)",
                fontSize: "var(--text-xs)",
                padding: "0.5rem",
              }}
            >
              {t("common.loading")}
            </div>
          )}
        </div>
      )}

      <Modal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title={t("planList.modalTitle")}
        description={t("planList.modalDesc")}
      >
        <form
          onSubmit={handleCreateSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <Input
            label={t("planList.nameLabel")}
            placeholder={t("planList.namePlaceholder")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            label={t("planList.budgetLabel")}
            type="number"
            min="0"
            step="10000"
            value={budgetTarget}
            onChange={(e) => setBudgetTarget(e.target.value)}
            required
          />
          <Input
            label={t("planList.dateLabel")}
            type="date"
            value={shoppingDate}
            onChange={(e) => setShoppingDate(e.target.value)}
            required
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
              paddingTop: "0.5rem",
            }}
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={creating}>
              {creating ? t("common.saving") : t("planList.createButton")}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={editingPlan !== null}
        onOpenChange={(open) => {
          if (!open) setEditingPlan(null);
        }}
        title={t("planList.editTitle")}
        description={t("planList.editDesc")}
      >
        <form
          onSubmit={handleUpdateSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <Input
            label={t("planList.nameLabel")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            label={t("planList.budgetLabel")}
            type="number"
            min="0"
            step="10000"
            value={budgetTarget}
            onChange={(e) => setBudgetTarget(e.target.value)}
            required
          />
          <Input
            label={t("planList.dateLabel")}
            type="date"
            value={shoppingDate}
            onChange={(e) => setShoppingDate(e.target.value)}
            required
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
              paddingTop: "0.5rem",
            }}
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingPlan(null)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={savingPlan}>
              {savingPlan ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deletingPlan !== null}
        onOpenChange={(open) => {
          if (!open && !savingPlan) setDeletingPlan(null);
        }}
        title={t("planList.deleteTitle")}
        description={t("planList.deleteDesc", { title: deletingPlan?.title })}
      >
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDeletingPlan(null)}
            disabled={savingPlan}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => void handleDelete()}
            disabled={savingPlan}
          >
            {savingPlan ? t("common.saving") : t("common.delete")}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
