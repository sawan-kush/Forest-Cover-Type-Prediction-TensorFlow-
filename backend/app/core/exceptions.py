"""Custom exceptions and their HTTP handlers."""
import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger("app")


class ArtifactLoadError(RuntimeError):
    """Raised when a model artifact is missing, unreadable, or inconsistent."""


class ModelNotReadyError(RuntimeError):
    """Raised when a prediction is requested but the model is not loaded."""


class InputValidationError(ValueError):
    """Raised when the submitted feature values are invalid."""

    def __init__(self, errors: list[dict]):
        self.errors = errors
        super().__init__(f"{len(errors)} invalid or missing input value(s).")


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(InputValidationError)
    async def _input_error(_: Request, exc: InputValidationError):
        return JSONResponse(
            status_code=422,
            content={"detail": "Some input values are missing or invalid.", "errors": exc.errors},
        )

    @app.exception_handler(RequestValidationError)
    async def _schema_error(_: Request, exc: RequestValidationError):
        errors, seen = [], set()
        for e in exc.errors():
            loc = [str(p) for p in e["loc"] if p != "body"]
            if len(loc) >= 2 and loc[0] == "features":
                field, message = loc[1], "Value must be a number."  # e.g. text or true/false
            else:
                field, message = ".".join(loc) or "body", e["msg"]
            if (field, message) not in seen:
                seen.add((field, message))
                errors.append({"field": field, "message": message})
        return JSONResponse(
            status_code=422,
            content={"detail": "The request body is not in the expected format.", "errors": errors},
        )

    @app.exception_handler(ModelNotReadyError)
    async def _not_ready(_: Request, exc: ModelNotReadyError):
        return JSONResponse(status_code=503, content={"detail": str(exc), "errors": []})

    @app.exception_handler(Exception)
    async def _unexpected(_: Request, exc: Exception):
        logger.exception("Unhandled error", exc_info=exc)
        return JSONResponse(
            status_code=500,
            content={"detail": "Unexpected server error while processing the request.", "errors": []},
        )
