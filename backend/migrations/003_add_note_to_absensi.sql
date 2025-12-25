-- Migration: Add note column to absensi table
-- Date: 2025-12-25

ALTER TABLE `absensi` 
ADD COLUMN `note` TEXT DEFAULT NULL AFTER `checklist_submitted`;
