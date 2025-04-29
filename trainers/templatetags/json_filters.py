from django import template
import json

register = template.Library()

@register.filter
def parse_json(json_string):
    """Convert a JSON string to a Python dictionary"""
    try:
        if not json_string:
            return {}
        return json.loads(json_string)
    except (ValueError, TypeError):
        return {}

