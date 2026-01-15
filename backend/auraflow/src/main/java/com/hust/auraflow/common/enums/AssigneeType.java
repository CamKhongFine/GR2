package com.hust.auraflow.common.enums;

import java.util.Arrays;

public enum AssigneeType {

    FIXED("FIXED", "Fixed Assignee"),
    DYNAMIC("DYNAMIC", "Dynamic Assignee");

    private final String code;
    private final String displayName;

    AssigneeType(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Finds an AssigneeType by its code.
     *
     * @param code the assignee type code to search for
     * @return the matching AssigneeType
     * @throws IllegalArgumentException if no matching type is found
     */
    public static AssigneeType fromCode(String code) {
        return Arrays.stream(values())
                .filter(type -> type.code.equals(code))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown AssigneeType code: " + code));
    }
}
