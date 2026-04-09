import { MENU_NO } from '@/constants'
import { CredentialManager } from '@/credential-manager'
import * as formatters from '@/formatters'
import { SomaHttp } from '@/http'
import {
  buildApplicationPayload,
  buildCancelApplicationPayload,
  buildDeleteMentoringPayload,
  buildMentoringPayload,
  buildRoomReservationPayload,
  parseEventDetail,
  resolveRoomId,
} from '@/shared/utils/swmaestro'
import type {
  ApplicationHistoryItem,
  Dashboard,
  EventListItem,
  MemberInfo,
  MentoringDetail,
  MentoringListItem,
  NoticeDetail,
  NoticeListItem,
  Pagination,
  RoomCard,
  TeamInfo,
} from '@/types'

export interface SomaClientOptions {
  sessionCookie?: string
  csrfToken?: string
  username?: string
  password?: string
}

export class SomaClient {
  private readonly http: SomaHttp
  private readonly options: SomaClientOptions

  readonly mentoring: {
    list(options?: {
      status?: string
      type?: string
      page?: number
    }): Promise<{ items: MentoringListItem[]; pagination: Pagination }>
    get(id: number): Promise<MentoringDetail>
    create(params: {
      title: string
      type: 'free' | 'lecture'
      date: string
      startTime: string
      endTime: string
      venue: string
      maxAttendees?: number
      regStart?: string
      regEnd?: string
      content?: string
    }): Promise<void>
    delete(id: number): Promise<void>
    apply(id: number): Promise<void>
    cancel(params: { applySn: number; qustnrSn: number }): Promise<void>
    history(options?: { page?: number }): Promise<{ items: ApplicationHistoryItem[]; pagination: Pagination }>
  }

  readonly room: {
    list(options?: { date?: string; room?: string }): Promise<RoomCard[]>
    available(roomId: number, date: string): Promise<RoomCard['timeSlots']>
    reserve(params: {
      roomId: number
      date: string
      slots: string[]
      title: string
      attendees?: number
      notes?: string
    }): Promise<void>
  }

  readonly dashboard: {
    get(): Promise<Dashboard>
  }

  readonly notice: {
    list(options?: { page?: number }): Promise<{ items: NoticeListItem[]; pagination: Pagination }>
    get(id: number): Promise<NoticeDetail>
  }

  readonly team: {
    show(): Promise<TeamInfo>
  }

  readonly member: {
    show(): Promise<MemberInfo>
  }

  readonly event: {
    list(options?: { page?: number }): Promise<{ items: EventListItem[]; pagination: Pagination }>
    get(id: number): Promise<unknown>
    apply(id: number): Promise<void>
  }

  constructor(options: SomaClientOptions = {}) {
    this.options = options
    this.http = new SomaHttp({ sessionCookie: options.sessionCookie, csrfToken: options.csrfToken })

    this.mentoring = {
      list: async (options) => {
        const params: Record<string, string> = { menuNo: MENU_NO.MENTORING }
        if (options?.status) params.searchStatMentolec = options.status
        if (options?.type) params.searchGubunMentolec = options.type
        if (options?.page) params.pageIndex = String(options.page)
        const html = await this.http.get('/mypage/mentoLec/list.do', params)
        return { items: formatters.parseMentoringList(html), pagination: formatters.parsePagination(html) }
      },
      get: async (id) =>
        formatters.parseMentoringDetail(
          await this.http.get('/mypage/mentoLec/view.do', { menuNo: MENU_NO.MENTORING, qustnrSn: String(id) }),
          id,
        ),
      create: async (params) => {
        await this.http.post('/mypage/mentoLec/insert.do', buildMentoringPayload(params))
      },
      delete: async (id) => {
        await this.http.post('/mypage/mentoLec/delete.do', buildDeleteMentoringPayload(id))
      },
      apply: async (id) => {
        await this.http.post('/application/application/application.do', buildApplicationPayload(id))
      },
      cancel: async (params) => {
        await this.http.post('/mypage/userAnswer/cancel.do', buildCancelApplicationPayload(params))
      },
      history: async (options) => {
        const html = await this.http.get('/mypage/userAnswer/history.do', {
          menuNo: MENU_NO.APPLICATION_HISTORY,
          ...(options?.page ? { pageIndex: String(options.page) } : {}),
        })
        return { items: formatters.parseApplicationHistory(html), pagination: formatters.parsePagination(html) }
      },
    }

    this.room = {
      list: async (options) =>
        formatters.parseRoomList(
          await this.http.post('/mypage/officeMng/list.do', {
            menuNo: MENU_NO.ROOM,
            sdate: options?.date ?? new Date().toISOString().slice(0, 10),
            searchItemId: options?.room ? String(resolveRoomId(options.room)) : '',
          }),
        ),
      available: async (roomId, date) =>
        formatters.parseRoomSlots(
          await this.http.post('/mypage/officeMng/rentTime.do', {
            viewType: 'CONTBODY',
            itemId: String(roomId),
            rentDt: date,
          }),
        ),
      reserve: async (params) => {
        await this.http.post('/mypage/itemRent/insert.do', buildRoomReservationPayload(params))
      },
    }

    this.dashboard = {
      get: async () =>
        formatters.parseDashboard(await this.http.get('/mypage/myMain/dashboard.do', { menuNo: MENU_NO.DASHBOARD })),
    }

    this.notice = {
      list: async (options) => {
        const html = await this.http.get('/mypage/myNotice/list.do', {
          menuNo: MENU_NO.NOTICE,
          ...(options?.page ? { pageIndex: String(options.page) } : {}),
        })
        return { items: formatters.parseNoticeList(html), pagination: formatters.parsePagination(html) }
      },
      get: async (id) =>
        formatters.parseNoticeDetail(
          await this.http.get('/mypage/myNotice/view.do', { menuNo: MENU_NO.NOTICE, nttId: String(id) }),
          id,
        ),
    }

    this.team = {
      show: async () =>
        formatters.parseTeamInfo(await this.http.get('/mypage/myTeam/team.do', { menuNo: MENU_NO.TEAM })),
    }

    this.member = {
      show: async () =>
        formatters.parseMemberInfo(
          await this.http.get('/mypage/myInfo/forUpdateMy.do', { menuNo: MENU_NO.MEMBER_INFO }),
        ),
    }

    this.event = {
      list: async (options) => {
        const html = await this.http.get('/mypage/applicants/list.do', {
          menuNo: MENU_NO.EVENT,
          ...(options?.page ? { pageIndex: String(options.page) } : {}),
        })
        return { items: formatters.parseEventList(html), pagination: formatters.parsePagination(html) }
      },
      get: async (id) =>
        parseEventDetail(
          await this.http.get('/mypage/applicants/view.do', { menuNo: MENU_NO.EVENT, bbsId: String(id) }),
        ),
      apply: async (id) => {
        await this.http.post('/application/application/application.do', buildApplicationPayload(id))
      },
    }
  }

  async login(username?: string, password?: string): Promise<void> {
    const resolvedUsername = username ?? this.options.username
    const resolvedPassword = password ?? this.options.password

    if (!resolvedUsername || !resolvedPassword) {
      throw new Error('Username and password are required')
    }

    await this.http.login(resolvedUsername, resolvedPassword)
  }

  isLoggedIn(): Promise<boolean> {
    return this.http.checkLogin()
  }

  async saveCredentials(manager = new CredentialManager()): Promise<void> {
    const sessionCookie = this.http.getSessionCookie()
    const csrfToken = this.http.getCsrfToken()

    if (!sessionCookie || !csrfToken) {
      throw new Error('Missing session cookie or CSRF token')
    }

    await manager.setCredentials({
      sessionCookie,
      csrfToken,
      username: this.options.username,
      loggedInAt: new Date().toISOString(),
    })
  }
}
