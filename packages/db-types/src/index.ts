/**
 * Hand-authored mirror of supabase/migrations/0001_init.sql, shaped like the
 * output of `supabase gen types typescript`. Once a live Supabase project
 * exists, regenerate with:
 *   supabase gen types typescript --project-id <ref> > packages/db-types/src/index.ts
 * and re-add the named union exports below (ProjectRole, etc.) that consumers import.
 *
 * `Relationships: []` on every table is a deliberate simplification: the real
 * generator emits foreign-key metadata there (used for typed embedded/nested
 * selects like `project:projects(*)`), but an empty array still satisfies
 * supabase-js's `GenericTable` constraint, which is what actually matters for
 * `.from()/.insert()/.update()` to infer real types instead of `never`.
 */

export type ProjectRole = "owner" | "administrator" | "game_master" | "editor" | "player" | "viewer";
export type ProjectMemberStatus = "invited" | "active" | "removed";
export type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";
export type ProjectNodeType = "world_entry" | "map" | "campaign";
export type MapObjectType = "marker" | "label";
export type CampaignStatus = "active" | "archived";
export type CampaignMemberRole = "game_master" | "player";
export type ContentStatus = "draft" | "published" | "archived";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          privacy_settings: Record<string, unknown>;
          notification_settings: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          owner_id: string;
          created_at: string;
          updated_at: string;
          archived_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["projects"]["Row"]> & {
          name: string;
          slug: string;
          owner_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Row"]>;
        Relationships: [];
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: ProjectRole;
          status: ProjectMemberStatus;
          invited_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["project_members"]["Row"]> & {
          project_id: string;
          user_id: string;
          role: ProjectRole;
        };
        Update: Partial<Database["public"]["Tables"]["project_members"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      invitations: {
        Row: {
          id: string;
          project_id: string;
          email: string;
          role: Exclude<ProjectRole, "owner">;
          token: string;
          status: InvitationStatus;
          invited_by: string;
          expires_at: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["invitations"]["Row"]> & {
          project_id: string;
          email: string;
          role: Exclude<ProjectRole, "owner">;
          invited_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["invitations"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "invitations_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_nodes: {
        Row: {
          id: string;
          project_id: string;
          node_type: ProjectNodeType;
          search_text: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["project_nodes"]["Row"]> & {
          project_id: string;
          node_type: ProjectNodeType;
        };
        Update: Partial<Database["public"]["Tables"]["project_nodes"]["Row"]>;
        Relationships: [];
      };
      world_builder_entries: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          slug: string;
          content_text: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["world_builder_entries"]["Row"]> & {
          id: string;
          project_id: string;
          title: string;
          slug: string;
          created_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["world_builder_entries"]["Row"]>;
        Relationships: [];
      };
      entry_links: {
        Row: {
          id: string;
          project_id: string;
          source_entry_id: string;
          target_node_id: string | null;
          link_text: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["entry_links"]["Row"]> & {
          project_id: string;
          source_entry_id: string;
          link_text: string;
        };
        Update: Partial<Database["public"]["Tables"]["entry_links"]["Row"]>;
        Relationships: [];
      };
      maps: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          width: number;
          height: number;
          background_url: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["maps"]["Row"]> & {
          id: string;
          project_id: string;
          name: string;
          created_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["maps"]["Row"]>;
        Relationships: [];
      };
      map_objects: {
        Row: {
          id: string;
          map_id: string;
          object_type: MapObjectType;
          x: number;
          y: number;
          layer_id: string;
          data: Record<string, unknown>;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["map_objects"]["Row"]> & {
          map_id: string;
          object_type: MapObjectType;
          x: number;
          y: number;
          created_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["map_objects"]["Row"]>;
        Relationships: [];
      };
      campaigns: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          description: string | null;
          status: CampaignStatus;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["campaigns"]["Row"]> & {
          id: string;
          project_id: string;
          name: string;
          created_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["campaigns"]["Row"]>;
        Relationships: [];
      };
      campaign_members: {
        Row: {
          id: string;
          campaign_id: string;
          user_id: string;
          role: CampaignMemberRole;
          joined_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["campaign_members"]["Row"]> & {
          campaign_id: string;
          user_id: string;
          role: CampaignMemberRole;
        };
        Update: Partial<Database["public"]["Tables"]["campaign_members"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "campaign_members_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaign_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      content_items: {
        Row: {
          id: string;
          type: string;
          title: string;
          body: Record<string, unknown>;
          status: ContentStatus;
          version: number;
          published_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["content_items"]["Row"]> & {
          title: string;
          created_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["content_items"]["Row"]>;
        Relationships: [];
      };
      content_item_versions: {
        Row: {
          id: string;
          content_item_id: string;
          version: number;
          title: string;
          body: Record<string, unknown>;
          edited_by: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          payload: Record<string, unknown>;
          read_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notifications"]["Row"]> & {
          user_id: string;
          type: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
        Relationships: [];
      };
      admin_users: {
        Row: {
          user_id: string;
          granted_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["admin_users"]["Row"]> & { user_id: string };
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_project_role: {
        Args: { p_project_id: string; p_min_role: ProjectRole };
        Returns: boolean;
      };
      create_world_entry: {
        Args: { p_project_id: string; p_title: string; p_slug: string };
        Returns: string;
      };
      create_map: {
        Args: { p_project_id: string; p_name: string };
        Returns: string;
      };
      create_campaign: {
        Args: { p_project_id: string; p_name: string; p_description: string | null };
        Returns: string;
      };
      accept_invitation: {
        Args: { p_token: string };
        Returns: string;
      };
      get_invitation_preview: {
        Args: { p_token: string };
        Returns: { project_name: string; role: ProjectRole; email: string; status: InvitationStatus }[];
      };
    };
  };
}
