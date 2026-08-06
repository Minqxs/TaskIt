# Basic Calculator Contract (Experimental)

This isolated experiment is not part of the HomeTask application, its API, or
its mobile client. It defines only a small calculator function.

## Function

```text
calculate(left: number, operator: "+" | "-" | "*" | "/", right: number)
  -> number | CalculatorError
```

`left` and `right` must be numeric inputs. `operator` must be exactly one of
`+`, `-`, `*`, or `/`.

## Results

| Operator | Result |
| --- | --- |
| `+` | `left + right` |
| `-` | `left - right` |
| `*` | `left * right` |
| `/` | `left / right`, when `right` is not zero |

## Errors

The function returns a clear error/message rather than allowing an unhandled
crash in these cases:

| Condition | Error/message |
| --- | --- |
| `operator` is unsupported | `Unsupported operator: {operator}` |
| `operator` is `/` and `right` is zero | `Division by zero is not allowed.` |
| either input is not numeric | `Both inputs must be numbers.` |

`CalculatorError` can be represented by the host language's ordinary error
result/message type. Callers must distinguish it from a numeric result before
using the result in another calculation.

## Scope

This contract intentionally includes only the four standard arithmetic
operations. It has no UI, history, memory, persistence, advanced operations,
or integration with existing application layers.

## Examples

```text
