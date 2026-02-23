import { create } from 'zustand';
import { StellarWalletsKit } from '../lib/wallet';

const STORAGE_KEY = 'cos_wallet_address';

interface WalletState {
    address: string | null;
    moduleName: string | null;
    balance: string | null;
    isConnecting: boolean;
    isFunded: boolean | null;
    isHydrated: boolean;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    checkBalance: (pubKey: string) => Promise<void>;
    fundAccount: () => Promise<void>;
    restoreSession: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
    address: null,
    moduleName: null,
    balance: null,
    isConnecting: false,
    isFunded: null,
    isHydrated: false,

    restoreSession: async () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            set({ address: saved });
            await get().checkBalance(saved);
        }
        set({ isHydrated: true });
    },

    connect: async () => {
        set({ isConnecting: true });
        try {
            const { address } = await StellarWalletsKit.authModal();
            if (address) {
                localStorage.setItem(STORAGE_KEY, address);
                set({ address });
                await get().checkBalance(address);
            }
        } catch (e) {
            console.error('Wallet connection error', e);
        } finally {
            set({ isConnecting: false });
        }
    },

    disconnect: async () => {
        try {
            await StellarWalletsKit.disconnect();
        } catch (e) {
            console.error(e);
        }
        localStorage.removeItem(STORAGE_KEY);
        set({ address: null, moduleName: null, balance: null, isFunded: null });
    },

    checkBalance: async (pubKey: string) => {
        try {
            const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${pubKey}`);
            if (response.status === 404) {
                set({ isFunded: false, balance: '0' });
                return;
            }
            const data = await response.json();
            const nativeBalance = data.balances.find((b: any) => b.asset_type === 'native');
            set({
                isFunded: true,
                balance: nativeBalance ? nativeBalance.balance : '0',
            });
        } catch (error) {
            console.error('Error checking balance:', error);
        }
    },

    fundAccount: async () => {
        const { address } = get();
        if (!address) return;

        try {
            set({ isConnecting: true });
            const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`);
            if (response.ok) {
                await get().checkBalance(address);
            } else {
                console.error('Failed to fund account');
            }
        } catch (error) {
            console.error('Error funding account:', error);
        } finally {
            set({ isConnecting: false });
        }
    },
}));
