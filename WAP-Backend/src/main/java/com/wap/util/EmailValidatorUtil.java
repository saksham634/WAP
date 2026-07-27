package com.wap.util;

import java.util.List;

public class EmailValidatorUtil {
    private static final List<String> ALLOWED_DOMAINS = List.of(
        "gmail.com", "outlook.com", "hotmail.com", "icloud.com", "yahoo.com"
    );

    public static boolean isPublicDomain(String email) {
        if (email == null || !email.contains("@")) return false;
        String domain = email.substring(email.indexOf("@") + 1).toLowerCase();
        return ALLOWED_DOMAINS.contains(domain);
    }
}