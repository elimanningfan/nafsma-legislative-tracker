"""Configuration loader for NAFSMA Legislative Tracker."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, Optional

import yaml


def get_project_root() -> Path:
    """Get the project root directory."""
    return Path(__file__).parent.parent.parent


def load_config(config_path: Optional[str] = None) -> Dict[str, Any]:
    """Load configuration from YAML file.

    Args:
        config_path: Optional path to config file. Defaults to data/config.yaml.

    Returns:
        Configuration dictionary.
    """
    if config_path is None:
        config_path = get_project_root() / "data" / "config.yaml"
    else:
        config_path = Path(config_path)

    with open(config_path) as f:
        config = yaml.safe_load(f)

    return config


def get_api_key(key_name: str) -> str:
    """Get API key from environment variable.

    Args:
        key_name: Name of the environment variable.

    Returns:
        API key value.

    Raises:
        ValueError: If the environment variable is not set.
    """
    value = os.environ.get(key_name)
    if not value:
        raise ValueError(f"Environment variable {key_name} is not set")
    return value


def get_congress_api_key() -> str:
    """Get Congress.gov API key from environment."""
    return get_api_key("CONGRESS_API_KEY")


def get_sendgrid_api_key() -> str:
    """Get SendGrid API key from environment."""
    return get_api_key("SENDGRID_API_KEY")
