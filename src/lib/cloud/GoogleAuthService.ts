import type { GoogleUser } from "./types";

/**
 * Placeholder for Google Identity Services.
 * Simulates network latency and basic login/logout.
 */
class GoogleAuthServiceImpl {
  private user: GoogleUser | null = null;

  async login(): Promise<GoogleUser> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock always succeeds — no random failure
        // In production, handle actual Google Identity Services errors
        this.user = {
          id: "g_12345",
          name: "Ayah Budi",
          email: "ayah.budi@example.com",
          avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi",
        };
        resolve(this.user);
      }, 800);
    });
  }

  async logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.user = null;
        resolve();
      }, 400);
    });
  }

  getUser(): GoogleUser | null {
    return this.user;
  }
}

export const googleAuthService = new GoogleAuthServiceImpl();
