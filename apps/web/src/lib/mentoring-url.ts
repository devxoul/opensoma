export interface MentoringQueryParams {
  status?: string
  type?: string
  search?: string
  page?: string
}

export function buildMentoringUrl(params?: MentoringQueryParams): string {
  if (!params) return '/mentoring'

  const searchParams = new URLSearchParams()

  if (params.status) searchParams.set('status', params.status)
  if (params.type) searchParams.set('type', params.type)
  if (params.search) searchParams.set('search', params.search)
  if (params.page) searchParams.set('page', params.page)

  const query = searchParams.toString()
  return query ? `/mentoring?${query}` : '/mentoring'
}
