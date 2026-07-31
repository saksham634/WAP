package com.wap.util;

import com.wap.entity.User;
import com.wap.service.AdminService;

public class PermissionUtil {

    public static boolean hasPermission(User user, String permissionKey) {
        if (user == null) return false;
        if ("ROLE_ADMIN".equals(user.getRole().getRoleName())) return true;

        String perms = user.getPermissions();
        if (perms == null || perms.trim().isEmpty()) {
            perms = AdminService.getDefaultPermissionsForRole(user.getRole().getRoleName());
        }

        if (perms.contains("ALL")) return true;

        String[] parts = perms.split(",");
        for (String p : parts) {
            if (p.trim().equalsIgnoreCase(permissionKey)) {
                return true;
            }
        }
        return false;
    }

    public static void validatePermission(User user, String permissionKey) {
        if (!hasPermission(user, permissionKey)) {
            throw new RuntimeException("Access Denied: The '" + permissionKey + "' feature has been disabled for your account by System Administrator.");
        }
    }
}
