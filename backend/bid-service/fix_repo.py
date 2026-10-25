lines = open('internal/repository/bid_repository.go').read().split('\n')

# Find orphaned code
orphan_start = None
for i, line in enumerate(lines):
    if "rows, err := r.db.Query(ctx, `SELECT" in line and "ORDER BY b.created_at DESC`)" in line:
        orphan_start = i
        break

print('Found orphan at line:', orphan_start + 1 if orphan_start is not None else 'NOT FOUND')

if orphan_start is not None:
    # Find end - next 'func '
    end = orphan_start
    for j in range(orphan_start, len(lines)):
        if lines[j].startswith('func '):
            end = j
            break
    print('Removing lines', orphan_start+1, 'to', end)
    del lines[orphan_start:end]
    
    # Build the method string using concatenation
    method_lines = [
        "func (r *BidRepository) ListByEmployer(ctx context.Context, employerID string) ([]Bid, error) {",
        "\trows, err := r.db.Query(ctx, `SELECT ` + 'bidColumns+bidFrom+` WHERE j.user_id = $1 ORDER BY b.created_at DESC`, employerID)",
        "\tif err != nil {",
        "\t\treturn nil, err",
        "\t}",
        "\tdefer rows.Close()",
        "",
        "\tbids := []Bid{}",
        "\tfor rows.Next() {",
        "\t\tb, err := scanBid(rows)",
        "\t\tif err != nil {",
        "\t\t\treturn nil, err",
        "\t\t}",
        "\t\tbids = append(bids, b)",
        "\t}",
        "\treturn bids, rows.Err()",
        "}",
        "",
    ]
    lines[orphan_start:orphan_start] = method_lines
    open('internal/repository/bid_repository.go', 'w').write('\n'.join(lines))
    print('Done')
"