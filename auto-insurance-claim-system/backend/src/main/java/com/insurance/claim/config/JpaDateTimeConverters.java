package com.insurance.claim.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * Robust JPA Attribute Converters for SQLite persistence.
 * Prevents SQLite JDBC driver from invoking FastDateFormat parser which fails on
 * SQLite string date variations (e.g., missing milliseconds or spaces instead of T).
 */
public class JpaDateTimeConverters {

    private static final DateTimeFormatter[] DATE_FORMATTERS = {
            DateTimeFormatter.ISO_LOCAL_DATE,                         // 2026-01-01
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),       // 2026-01-01 00:00:00
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"),   // 2026-01-01 00:00:00.000
            DateTimeFormatter.ISO_LOCAL_DATE_TIME                     // 2026-01-01T00:00:00
    };

    private static final DateTimeFormatter[] DATETIME_FORMATTERS = {
            DateTimeFormatter.ISO_LOCAL_DATE_TIME,                     // 2026-11-16T14:35:00
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),       // 2026-11-16 14:35:00
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"),   // 2026-11-16 14:35:00.123
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"),          // 2026-11-16 14:35
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm")         // 2026-11-16T14:35
    };

    @Converter(autoApply = true)
    public static class LocalDateConverter implements AttributeConverter<LocalDate, String> {

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
            for (DateTimeFormatter formatter : DATE_FORMATTERS) {
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

    @Converter(autoApply = true)
    public static class LocalDateTimeConverter implements AttributeConverter<LocalDateTime, String> {

        @Override
        public String convertToDatabaseColumn(LocalDateTime dateTime) {
            if (dateTime == null) {
                return null;
            }
            return dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        }

        @Override
        public LocalDateTime convertToEntityAttribute(String dbData) {
            if (dbData == null || dbData.trim().isEmpty()) {
                return null;
            }
            String cleaned = dbData.trim();
            for (DateTimeFormatter formatter : DATETIME_FORMATTERS) {
                try {
                    return LocalDateTime.parse(cleaned, formatter);
                } catch (DateTimeParseException ignored) {
                }
            }
            // Handle space vs T
            try {
                if (cleaned.contains(" ") && !cleaned.contains("T")) {
                    cleaned = cleaned.replace(" ", "T");
                }
                if (cleaned.length() == 16) {
                    cleaned += ":00";
                }
                return LocalDateTime.parse(cleaned);
            } catch (Exception ignored) {
            }
            return null;
        }
    }
}
