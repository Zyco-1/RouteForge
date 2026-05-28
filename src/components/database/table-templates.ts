export const TABLE_TEMPLATES = {
  users: {
    name: "users",
    columns: [
      { name: "id", type: "uuid", primary: true, nullable: false, default: "gen_random_uuid()" },
      { name: "email", type: "text", primary: false, nullable: false, default: "" },
      { name: "full_name", type: "text", primary: false, nullable: true, default: "" },
      { name: "avatar_url", type: "text", primary: false, nullable: true, default: "" },
      { name: "created_at", type: "timestamptz", primary: false, nullable: false, default: "now()" }
    ]
  },
  products: {
    name: "products",
    columns: [
      { name: "id", type: "uuid", primary: true, nullable: false, default: "gen_random_uuid()" },
      { name: "name", type: "text", primary: false, nullable: false, default: "" },
      { name: "description", type: "text", primary: false, nullable: true, default: "" },
      { name: "price", type: "int8", primary: false, nullable: false, default: "0" },
      { name: "stock", type: "int8", primary: false, nullable: false, default: "0" },
      { name: "created_at", type: "timestamptz", primary: false, nullable: false, default: "now()" }
    ]
  },
  profiles: {
    name: "profiles",
    columns: [
      { name: "id", type: "uuid", primary: true, nullable: false, default: "gen_random_uuid()" },
      { name: "username", type: "text", primary: false, nullable: false, default: "" },
      { name: "bio", type: "text", primary: false, nullable: true, default: "" },
      { name: "website", type: "text", primary: false, nullable: true, default: "" },
      { name: "updated_at", type: "timestamptz", primary: false, nullable: true, default: "now()" }
    ]
  }
};
