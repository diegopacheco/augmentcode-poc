package config

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoad(t *testing.T) {
	t.Run("should load default values when no env vars set", func(t *testing.T) {
		clearEnvVars()
		
		cfg := Load()
		
		assert.Equal(t, "localhost", cfg.DBHost)
		assert.Equal(t, "3306", cfg.DBPort)
		assert.Equal(t, "root", cfg.DBUser)
		assert.Equal(t, "password", cfg.DBPassword)
		assert.Equal(t, "coaching_db", cfg.DBName)
		assert.Equal(t, "8080", cfg.Port)
	})

	t.Run("should load custom values from env vars", func(t *testing.T) {
		clearEnvVars()
		
		os.Setenv("DB_HOST", "custom-host")
		os.Setenv("DB_PORT", "5432")
		os.Setenv("DB_USER", "custom-user")
		os.Setenv("DB_PASSWORD", "custom-pass")
		os.Setenv("DB_NAME", "custom_db")
		os.Setenv("PORT", "9000")
		
		cfg := Load()
		
		assert.Equal(t, "custom-host", cfg.DBHost)
		assert.Equal(t, "5432", cfg.DBPort)
		assert.Equal(t, "custom-user", cfg.DBUser)
		assert.Equal(t, "custom-pass", cfg.DBPassword)
		assert.Equal(t, "custom_db", cfg.DBName)
		assert.Equal(t, "9000", cfg.Port)
		
		clearEnvVars()
	})

	t.Run("should use env var when set and default when not", func(t *testing.T) {
		clearEnvVars()
		
		os.Setenv("DB_HOST", "env-host")
		os.Setenv("PORT", "3000")
		
		cfg := Load()
		
		assert.Equal(t, "env-host", cfg.DBHost)
		assert.Equal(t, "3306", cfg.DBPort)
		assert.Equal(t, "root", cfg.DBUser)
		assert.Equal(t, "password", cfg.DBPassword)
		assert.Equal(t, "coaching_db", cfg.DBName)
		assert.Equal(t, "3000", cfg.Port)
		
		clearEnvVars()
	})

	t.Run("should handle empty env vars", func(t *testing.T) {
		clearEnvVars()
		
		os.Setenv("DB_HOST", "")
		os.Setenv("DB_PORT", "")
		
		cfg := Load()
		
		assert.Equal(t, "localhost", cfg.DBHost)
		assert.Equal(t, "3306", cfg.DBPort)
		
		clearEnvVars()
	})
}

func TestGetEnv(t *testing.T) {
	t.Run("should return env value when set", func(t *testing.T) {
		os.Setenv("TEST_VAR", "test-value")
		
		result := getEnv("TEST_VAR", "default-value")
		
		assert.Equal(t, "test-value", result)
		
		os.Unsetenv("TEST_VAR")
	})

	t.Run("should return default value when env not set", func(t *testing.T) {
		os.Unsetenv("TEST_VAR")
		
		result := getEnv("TEST_VAR", "default-value")
		
		assert.Equal(t, "default-value", result)
	})

	t.Run("should return default value when env is empty", func(t *testing.T) {
		os.Setenv("TEST_VAR", "")
		
		result := getEnv("TEST_VAR", "default-value")
		
		assert.Equal(t, "default-value", result)
		
		os.Unsetenv("TEST_VAR")
	})

	t.Run("should handle special characters in values", func(t *testing.T) {
		specialValue := "user:pass@host:port/db?param=value"
		os.Setenv("TEST_VAR", specialValue)
		
		result := getEnv("TEST_VAR", "default")
		
		assert.Equal(t, specialValue, result)
		
		os.Unsetenv("TEST_VAR")
	})
}

func clearEnvVars() {
	os.Unsetenv("DB_HOST")
	os.Unsetenv("DB_PORT")
	os.Unsetenv("DB_USER")
	os.Unsetenv("DB_PASSWORD")
	os.Unsetenv("DB_NAME")
	os.Unsetenv("PORT")
}
