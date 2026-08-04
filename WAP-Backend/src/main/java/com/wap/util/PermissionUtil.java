package com.wap.util;

import com.wap.entity.User;
import com.wap.service.AdminService;

public class PermissionUtil {

    public static boolean hasPermission(User user, String permissionKey) {
        if (user == null) return false;
        if ("ROLE_ADMIN".equals(user.getRole().getRoleName())) return true;

        String perms = user.getPermissions();
        if (perms == null || perms.trim().isEmpty()) {
            if (user.getRole() != null && user.getRole().getPermissions() != null && !user.getRole().getPermissions().trim().isEmpty()) {
                perms = user.getRole().getPermissions();
            } else if (user.getRole() != null) {
                perms = AdminService.getDefaultPermissionsForRole(user.getRole().getRoleName());
            } else {
                perms = "DASHBOARD";
            }
        }

        if (perms.contains("ALL")) return true;

        String[] parts = perms.split(",");
        for (String p : parts) {
            String clean = p.trim();
            if (clean.equalsIgnoreCase(permissionKey)) {
                return true;
            }
            // Allow HR matching aliases
            if ("ATTENDANCE".equalsIgnoreCase(permissionKey) && ("ATTENDANCE_OVERVIEW".equalsIgnoreCase(clean) || "ROLE_HR".equals(user.getRole().getRoleName()))) {
                return true;
            }
            if ("LEAVES".equalsIgnoreCase(permissionKey) && ("LEAVE_APPROVALS".equalsIgnoreCase(clean) || "ROLE_HR".equals(user.getRole().getRoleName()))) {
                return true;
            }
            if ("PAYROLL".equalsIgnoreCase(permissionKey) && ("PAYROLL_ADMIN".equalsIgnoreCase(clean) || "ROLE_HR".equals(user.getRole().getRoleName()))) {
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
