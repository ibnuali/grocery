import React from "react";
import { Progress } from "./progress";
import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../i18n/format";

export interface BudgetBarProps {
  totalEstimated: number;
  budgetTarget: number;
  className?: string;
}

export const BudgetBar: React.FC<BudgetBarProps> = ({
  totalEstimated,
  budgetTarget,
  className = "",
}) => {
  const { t } = useTranslation();
  const hasTarget = budgetTarget > 0;
  const percentage = hasTarget
    ? Math.round((totalEstimated / budgetTarget) * 100)
    : 0;
  const isOver = hasTarget && totalEstimated > budgetTarget;
  const isClose = hasTarget && percentage >= 85 && !isOver;
  const variant = isOver ? "coral" : "accent";
  const status = isOver ? "over" : isClose ? "near" : "safe";

  return (
    <section
      className={`budget-bar ${className}`.trim()}
      aria-label={t("planDetail.totalEstimate")}
    >
      <div className="budget-bar__values">
        <div className="budget-bar__estimate">
          <span className="budget-bar__label">
            {t("planDetail.totalEstimate")}
          </span>
          <strong>{formatCurrency(totalEstimated)}</strong>
        </div>
        <div className="budget-bar__target">
          <span className="budget-bar__label">{t("budget.target")}</span>
          <strong
            className={
              hasTarget ? undefined : "budget-bar__target-value--empty"
            }
          >
            {hasTarget ? formatCurrency(budgetTarget) : t("budget.noTarget")}
          </strong>
        </div>
      </div>

      {hasTarget && (
        <>
          <div className="budget-bar__usage">
            <span>
              <TrendingUp aria-hidden="true" />
              {t("budget.usage")}
            </span>
            <strong>{percentage}%</strong>
          </div>
          <Progress
            value={percentage}
            colorVariant={variant}
            aria-label={t("budget.usage")}
          />
          <div className={`budget-bar__status budget-bar__status--${status}`}>
            {isOver ? (
              <AlertTriangle aria-hidden="true" />
            ) : isClose ? (
              <AlertTriangle aria-hidden="true" />
            ) : (
              <CheckCircle2 aria-hidden="true" />
            )}
            <span>
              {isOver
                ? `${t("budget.overBudget")} ${formatCurrency(totalEstimated - budgetTarget)}`
                : isClose
                  ? t("budget.nearBudget")
                  : `${t("budget.safe")} (${t("budget.remaining")} ${formatCurrency(budgetTarget - totalEstimated)})`}
            </span>
          </div>
        </>
      )}
    </section>
  );
};
