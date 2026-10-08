import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import './App.css'

// 1. 行データの型
type Person = {
  id: number
  familyName: string
  firstName: string
  age: number
  department: string
}

// 2. 表示するデータ（本来はAPIなどから取得）
const defaultData: Person[] = [
  { id: 1, familyName: '佐藤', firstName: '太郎', age: 28, department: '開発' },
  { id: 2, familyName: '鈴木', firstName: '次郎', age: 35, department: '営業' },
  { id: 3, familyName: '高橋', firstName: '三郎', age: 42, department: '人事' },
  { id: 4, familyName: '田中', firstName: '四郎', age: 23, department: '開発' },
  { id: 5, familyName: '伊藤', firstName: '五郎', age: 31, department: '営業' },
  { id: 6, familyName: '渡辺', firstName: '六郎', age: 39, department: '開発' },
  { id: 7, familyName: '山本', firstName: '七郎', age: 26, department: '人事' },
  { id: 8, familyName: '中村', firstName: '八郎', age: 45, department: '営業' },
  { id: 9, familyName: '小林', firstName: '九郎', age: 29, department: '開発' },
  { id: 10, familyName: '加藤', firstName: '十郎', age: 33, department: '人事' },
]

// 3. 使う機能を登録する（v9では必要な機能だけを明示的に選ぶ）
const features = tableFeatures({
  // ソート
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
  // 全体検索（グローバルフィルタは列フィルタ機能が前提）
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  // ページネーション
  rowPaginationFeature,
  // クライアントサイドでページネーション
  paginatedRowModel: createPaginatedRowModel(),
})

// 4. 列定義（columnHelperを使うと型推論が効く）
const columnHelper = createColumnHelper<typeof features, Person>()
const columns = columnHelper.columns([
  // ID
  columnHelper.accessor('id', { header: 'ID' }),
  // 氏名（グループ列：子の列が2つなので、ヘッダーが colSpan=2 になる）
  columnHelper.group({
    id: 'name',
    header: '氏名',
    columns: columnHelper.columns([
      columnHelper.accessor('familyName', { header: '姓' }),
      columnHelper.accessor('firstName', { header: '名' }),
    ]),
  }),
  // 年齢
  columnHelper.accessor('age', {
    header: '年齢',
    cell: (info) => `${info.getValue()}歳`, // セルの表示をカスタマイズ
  }),
  // 部署
  columnHelper.accessor('department', { header: '部署' }),
])

export default function App() {
  // 5. テーブルインスタンスを作成
  //    ソート・検索・ページの状態はテーブル自身が持ち、table.state で読める
  const table = useTable({
    features,
    columns,
    data: defaultData,
    globalFilterFn: 'includesString',
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
  })

  // 6. テーブルインスタンスから取得した情報でUIを描画（UIは自分で書く＝ヘッドレス）
  return (
    <div className="container">
      <h1>TanStack Table 入門ダヨ</h1>

      <input
        value={table.state.globalFilter ?? ''}
        onChange={(e) => table.setGlobalFilter(e.target.value)}
        placeholder="キーワードで絞り込み..."
      />

      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan} // グループ列のヘッダーは子の列数分、横に広がる
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {/* グループに属さない列は上の段に空のヘッダー（placeholder）ができるので何も描画しない */}
                  {header.isPlaceholder ? null : (
                    <>
                      <table.FlexRender header={header} />
                      {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted() as string] ?? ''}
                    </>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getAllCells().map((cell) => (
                <td key={cell.id}>
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          前へ
        </button>
        <span>
          {table.state.pagination.pageIndex + 1} / {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          次へ
        </button>
      </div>
    </div>
  )
}
