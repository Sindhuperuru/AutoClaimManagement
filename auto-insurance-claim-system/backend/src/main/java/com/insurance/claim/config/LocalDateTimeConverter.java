package com.insurance.claim.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * Top-level JPA Attribute Converter for LocalDateTime to prevent SQLite JDBC FastDateFormat errors.
 * SQLite stores timestamps as text (e.g. '2026-11-16 14:30:00').
 */
@Converter(autoApply = true)
public class LocalDateTimeConverter implements AttributeConverter<LocalDateTime, String> {

    private static final DateTimeFormatter[] FORMATTERS = {
            DateTimeFormatter.ISO_LOCAL_DATE_TIME,                     // 2026-11-16T14:35:00
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),       // 2026-11-16 14:35:00
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"),   // 2026-11-16 14:35:00.123
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"),          // 2026-11-16 14:35
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm")         // 2026-11-16T14:35
    };

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
        for (DateTimeFormatter formatter : FORMATTERS) {
            try {
                return LocalDateTime.parse(cleaned, formatter);
            } catch (DateTimeParseException ignored) {
            }
        }
        // Normalize space vs T
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
