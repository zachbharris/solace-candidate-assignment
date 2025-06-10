## Tooling

To make this project easier I installed a few extra dependencies
- @tanstack/react-query to handle query management, pagination, etc.
- nuqs to make search param usage much easier
- shadcn ui for quick interface components
- lodash for debounce utility
- react-table from shadcn ui for an easy table implementation

## Things I adjusted
- handle filtering on the server instead of client side
    - this way we can query through pagination
- initially I fixed some client side errors around keys for mapped elements, but those have been removed with the additional tooling I used

## Things I'd want to do
- show better loading / empty states
- indicate when a search query has begun, like user has made a query change but the debounce hasn't quite fired or the results haven't returned yet
- mobile support
