export interface Pager {
  current?: number
  pageSize: number
  total: number
  defaultPageSize?: number
  pageSizeOptions?: number[]
}

export interface SearchContent {
  pager: Pager,
  searchForm: any
}