// src/utils/authErrors.js

export class AuthError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "AuthError";

    // Esto asegura que el stack trace sea correcto en entornos V8 (Chrome/Node)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }
  }
}