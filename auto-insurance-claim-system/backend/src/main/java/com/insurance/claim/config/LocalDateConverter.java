package com.insurance.claim.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * Top-level JPA Attribute Converter for LocalDate to prevent SQLite JDBC FastDateFormat errors.
 * SQLite stores dates as plain text strings (e.g. '2026-01-01').
 */
@Converter(autoApply = true)
public class LocalDateConverter implements AttributeConverter<LocalDate, String> {

    private static final DateTimeFormatter[] FORMATTERS = {
            DateTimeFormatter.ISO_LOCAL_DATE,                         // 2026-01-01
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),       // 2026-01-01 00:00:00
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"),   // 2026-01-01 00:00:00.000
            DateTimeFormatter.ISO_LOCAL_DATE_TIME                     // 2026-01-01T00:00:00
    };

    @Override
    public String convertToDatabaseColumn(LocalDate date) {
        return date != null ? date.toString() : null;
    }

    @Override
    public LocalDate convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        String cleaned = dbData.trim();
        for (DateTimeFormatter formatter : FORMATTERS) {
            try {
                return LocalDate.parse(cleaned, formatter);
            } catch (DateTimeParseException ignored) {
            }
        }
        // Fallback: extract first 10 characters (yyyy-MM-dd)
        if (cleaned.length() >= 10) {
            try {
                return LocalDate.parse(cleaned.substring(0, 10));
            } catch (Exception ignored) {
            }
        }
        return null;
    }
}
