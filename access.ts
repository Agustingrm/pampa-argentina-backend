import { ListAccessArgs } from "./types";
import { permissionsList } from "./schemas/fields";

// The access control returns a yes or no value depending on the users session
export function isSignedIn({ session }: ListAccessArgs) {
  return !!session;
}

// Returns an object like this: {[permision1, boolean], [permision2,boolean], ...}
const generatedPermissions = Object.fromEntries(
  permissionsList.map((permission) => [
    permission,
    function ({ session }: ListAccessArgs) {
      return !!session?.data.role?.[permission];
    },
  ])
);

export const permissions = {
  ...generatedPermissions,
};

// Rule based function
// Return a boolean or a filter which limits which products they can CRUD.
export const rules = {
  canManageProducts({ session }: ListAccessArgs) {
    // This so instead of throwing an error of unreacheble ressorce,
    // Throw a message of you dont have access
    if (!isSignedIn({ session })) {
      return false;
    }
    // 1. Do they have the permission of canManageProducts
    if (permissions.canManageProducts({ session })) {
      return true;
    }
    // 2. If not, do they own this item?
    return { user: { id: session.itemId } };
  },
  canOrder({ session }: ListAccessArgs) {
    // This so instead of throwing an error of unreacheble ressorce,
    // Throw a message of you dont have access
    if (!isSignedIn({ session })) {
      return false;
    }
    // 1. Do they have the permission of canOrder
    if (permissions.canManageCart({ session })) {
      return true;
    }
    // 2. If not, do they own this item?
    return { user: { id: session.itemId } };
  },
  canManageOrderItems({ session }: ListAccessArgs) {
    // This so instead of throwing an error of unreacheble ressorce,
    // Throw a message of you dont have access
    if (!isSignedIn({ session })) {
      return false;
    }
    // 1. Do they have the permission of canManageOrderItems
    if (permissions.canManageCart({ session })) {
      return true;
    }
    // 2. If not, do they own this item?
    return { order: { user: { id: session.itemId } } };
  },
  canReadProducts({ session }: ListAccessArgs) {
    // This so instead of throwing an error of unreacheble ressorce,
    // Throw a message of you dont have access
    if (!isSignedIn({ session })) {
      return false;
    }
    if (permissions.canManageProducts({ session })) {
      return true; // They can read everything
    }
    // They should only see available products (based on the status field)
    return { status: "AVAILABLE" };
  },
  canManageUsers({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    if (permissions.canManageUsers({ session })) {
      return true;
    }
    // Otherwise they may only update themselves!
    return { id: session.itemId };
  },
};
