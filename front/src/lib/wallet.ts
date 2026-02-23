import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import { SwkAppDarkTheme } from "@creit.tech/stellar-wallets-kit/types";

// Initialize the kit globally
StellarWalletsKit.init({
    theme: {
        ...SwkAppDarkTheme,
        primary: "#1a1a1a",
        "primary-foreground": "rgba(255, 255, 255, 0.87)",
        "border-radius": "8px",
        background: "#1a1a1a",
        foreground: "rgba(255, 255, 255, 0.87)",
    },
    modules: [
        ...defaultModules(),
    ],
});

export { StellarWalletsKit };
