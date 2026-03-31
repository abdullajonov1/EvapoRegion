import { SessionManager, getAppStore, type IMState } from "jimu-core";

export class LogoutHandler {
  private trimPortalRestSuffix(url: string): string {
    return String(url || "")
      .replace(/\/sharing\/rest\/?$/i, "")
      .replace(/\/$/, "");
  }

  private getClientId(): string {
    const state = getAppStore().getState() as IMState & { clientId?: string };
    return state?.clientId || "";
  }

  private getPortalBaseUrl(): string {
    try {
      const mainSession = SessionManager.getInstance().getMainSession() as any;
      const portal = mainSession?.portal?.toString?.() || "";
      if (portal) return this.trimPortalRestSuffix(portal);
    } catch {
      // ignore
    }

    const state = getAppStore().getState() as IMState & {
      portalUrl?: string;
      appConfig?: { portalUrl?: string };
    };

    const portalUrl = state?.portalUrl || state?.appConfig?.portalUrl || "";
    if (portalUrl) return this.trimPortalRestSuffix(String(portalUrl));

    const fromConfig = (window as any)?.jimuConfig?.portalUrl || "";
    if (fromConfig) return this.trimPortalRestSuffix(String(fromConfig));

    return `${window.location.protocol}//${window.location.host}`;
  }

  private getSignedOutRedirectUrl(): string {
    const configured = (window as any)?.jimuConfig?.signInPageUrl || "";
    if (configured) return configured;
    return `${window.location.origin}/signin.html`;
  }

  logout(): void {
    const portalUrl = this.getPortalBaseUrl();
    const clientId = this.getClientId();
    const redirectUri = encodeURIComponent(this.getSignedOutRedirectUrl());

    try {
      SessionManager.getInstance().signOut();
      return;
    } catch {
      // continue to fallback flow
    }

    try {
      sessionStorage.clear();
      localStorage.removeItem("esriJSAPIOAuthData");
      localStorage.removeItem("arcgis_auth_origin");
    } catch {
      // ignore
    }

    const signoutUrl = clientId
      ? `${portalUrl}/sharing/rest/oauth2/signout?client_id=${encodeURIComponent(clientId)}&redirect_uri=${redirectUri}`
      : `${portalUrl}/home/signin.html?returnUrl=${redirectUri}`;

    window.location.assign(signoutUrl);
  }
}
