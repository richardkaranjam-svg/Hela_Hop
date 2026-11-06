export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type KycTier = "unverified" | "tier1" | "tier2" | "tier3";

export type PayoutMethod =
  "mpesa" | "bank" | "wave" | "airtel_money" | "manual";

export type TransactionStatus =
  "pending" | "processing" | "completed" | "failed" | "reversed" | "disputed";

export type PayerType = "customer" | "guest" | "merchant" | "system";

export type LedgerDirection = "credit" | "debit";

export type LedgerEntryType =
  | "payment_received"
  | "fee_charged"
  | "payout_sent"
  | "refund_issued"
  | "reversal"
  | "adjustment";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string;
          kyc_tier: KycTier;
          payout_method: PayoutMethod | null;
          payout_destination: string | null;
          kakitu_score_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          kyc_tier?: KycTier;
          payout_method?: PayoutMethod | null;
          payout_destination?: string | null;
          kakitu_score_points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          kyc_tier?: KycTier;
          payout_method?: PayoutMethod | null;
          payout_destination?: string | null;
          kakitu_score_points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payment_links: {
        Row: {
          id: string;
          slug: string;
          user_id: string;
          title: string;
          currency: string;
          amount_minor: number | null;
          is_active: boolean;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          user_id: string;
          title: string;
          currency: string;
          amount_minor?: number | null;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          user_id?: string;
          title?: string;
          currency?: string;
          amount_minor?: number | null;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_links_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          id: string;
          idempotency_key: string;
          provider_ref: string | null;
          payment_link_id: string | null;
          merchant_id: string | null;
          status: TransactionStatus;
          payer_type: PayerType;
          payer_ref: string | null;
          currency: string;
          amount_minor: number;
          fee_minor: number;
          metadata: Json | null;
          initiated_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          idempotency_key: string;
          provider_ref?: string | null;
          payment_link_id?: string | null;
          merchant_id?: string | null;
          status?: TransactionStatus;
          payer_type?: PayerType;
          payer_ref?: string | null;
          currency: string;
          amount_minor: number;
          fee_minor?: number;
          metadata?: Json | null;
          initiated_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          idempotency_key?: string;
          provider_ref?: string | null;
          payment_link_id?: string | null;
          merchant_id?: string | null;
          status?: TransactionStatus;
          payer_type?: PayerType;
          payer_ref?: string | null;
          currency?: string;
          amount_minor?: number;
          fee_minor?: number;
          metadata?: Json | null;
          initiated_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_merchant_id_fkey";
            columns: ["merchant_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_payment_link_id_fkey";
            columns: ["payment_link_id"];
            isOneToOne: false;
            referencedRelation: "payment_links";
            referencedColumns: ["id"];
          },
        ];
      };
      ledger_entries: {
        Row: {
          id: string;
          transaction_id: string;
          account_id: string | null;
          entry_type: LedgerEntryType;
          direction: LedgerDirection;
          amount_minor: number;
          currency: string;
          description: string | null;
          balance_after: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          account_id?: string | null;
          entry_type: LedgerEntryType;
          direction: LedgerDirection;
          amount_minor: number;
          currency: string;
          description?: string | null;
          balance_after: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          account_id?: string | null;
          entry_type?: LedgerEntryType;
          direction?: LedgerDirection;
          amount_minor?: number;
          currency?: string;
          description?: string | null;
          balance_after?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ledger_entries_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ledger_entries_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      kyc_tier: KycTier;
      payout_method: PayoutMethod;
      transaction_status: TransactionStatus;
      payer_type: PayerType;
      ledger_direction: LedgerDirection;
      ledger_entry_type: LedgerEntryType;
    };
    CompositeTypes: Record<string, never>;
  };
}

// Convenience helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

// Convenience entity types
export type Profile = Tables<"profiles">;
export type PaymentLink = Tables<"payment_links">;
export type Transaction = Tables<"transactions">;
export type LedgerEntry = Tables<"ledger_entries">;
