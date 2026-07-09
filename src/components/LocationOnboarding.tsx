import { useState } from "react";
import { useI18n } from "../i18n/useI18n";
import { LocationSyncError, syncCurrentLocation } from "../utils/locationSync";

interface Props {
  onManual: () => void;
  onDone: () => void;
}

export function LocationOnboarding({ onManual, onDone }: Props) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setBusy(true);
    setError(null);
    try {
      await syncCurrentLocation(true);
      onDone();
    } catch (e) {
      setError(e instanceof LocationSyncError ? e.message : t("syncLocationFail"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="location-onboarding-backdrop" role="dialog" aria-modal="true">
      <div className="location-onboarding-card">
        <h2 className="location-onboarding-title">{t("locationOnboardingTitle")}</h2>
        <p className="location-onboarding-body">{t("locationOnboardingBody")}</p>
        <p className="location-onboarding-tip">{t("syncLocationTip")}</p>

        {error && <p className="location-onboarding-error">{error}</p>}

        <div className="location-onboarding-actions">
          <button
            type="button"
            className="location-onboarding-primary"
            onClick={handleSync}
            disabled={busy}
          >
            {busy ? t("syncLocationBusy") : t("locationOnboardingSync")}
          </button>
          <button type="button" className="location-onboarding-secondary" onClick={onManual}>
            {t("locationOnboardingManual")}
          </button>
          <button type="button" className="location-onboarding-ghost" onClick={onDone}>
            {t("locationOnboardingSkip")}
          </button>
        </div>
      </div>
    </div>
  );
}
