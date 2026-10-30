import app from 'flarum/forum/app'
import Component from 'flarum/common/Component'
import FieldSet from 'flarum/common/components/FieldSet'
import Button from 'flarum/common/components/Button'
import LoadingIndicator from 'flarum/common/components/LoadingIndicator'
import humanTime from 'flarum/common/helpers/humanTime'
import extractText from 'flarum/common/utils/extractText'
import type User from 'flarum/common/models/User'
import type Mithril from 'mithril'

import blessingIcon from './BlessingIcon'

const PREFIX = 'blessing-oauth-client.forum.link'
const LINK_PATH = '/blessing-oauth/callback'
const LINK_STATUS_ENDPOINT = '/blessing-oauth/link'
const ENABLED_ATTRIBUTE = 'blessing-oauth-client.enabled'

export interface IBlessingLinkStatus {
  linked: boolean
  identifier: string | null
  createdAt: string | null
  lastLoginAt: string | null
}

interface IAttrs {
  user: User
}

interface IState {
  loading: boolean
  failed: boolean
  unlinking: boolean
  status: IBlessingLinkStatus | null
}

/**
 * Shows whether the current user has linked a Blessing Skin account, and lets
 * them link or unlink one from their security settings.
 */
export default class BlessingLinkedAccount extends Component<IAttrs, IState> {
  state: IState = {
    loading: true,
    failed: false,
    unlinking: false,
    status: null,
  }

  oninit(vnode: Mithril.Vnode<IAttrs, this>): void {
    super.oninit(vnode)

    void this.load()
  }

  view(): Mithril.Children {
    return (
      <FieldSet
        className="BlessingOAuth-linkedAccount"
        label={app.translator.trans(`${PREFIX}.heading`)}
      >
        <p className="helpText">{app.translator.trans(`${PREFIX}.help`)}</p>
        {this.state.loading ? (
          <LoadingIndicator />
        ) : this.state.failed ? (
          this.errorView()
        ) : (
          this.accountView()
        )}
      </FieldSet>
    )
  }

  private errorView(): Mithril.Children {
    return (
      <div className="BlessingOAuth-Account-errors">
        <p className="helpText">
          {app.translator.trans(`${PREFIX}.load_failed`)}
        </p>
        <Button className="Button" onclick={() => this.load()}>
          {app.translator.trans(`${PREFIX}.retry`)}
        </Button>
      </div>
    )
  }

  private accountView(): Mithril.Children {
    const linked = this.state.status?.linked === true

    return (
      <div
        className={`BlessingOAuth-Account ${
          linked
            ? 'BlessingOAuth-Account--linked'
            : 'BlessingOAuth-Account--unlinked'
        }`}
      >
        <div className="BlessingOAuth-Account-icon">
          {blessingIcon('BlessingOAuth-icon BlessingOAuth-Account-logo')}
        </div>
        <div className="BlessingOAuth-Account-info">
          <span className="BlessingOAuth-Account-name">
            {app.translator.trans(`${PREFIX}.name`)}
          </span>
          <span className="BlessingOAuth-Account-status">
            {app.translator.trans(
              `${PREFIX}.${linked ? 'status_linked' : 'status_unlinked'}`,
            )}
          </span>
          {linked ? this.linkedMeta() : null}
        </div>
        <div className="BlessingOAuth-Account-actions">
          {linked ? this.linkedActions() : this.unlinkedActions()}
        </div>
      </div>
    )
  }

  private linkedMeta(): Mithril.Children {
    const status = this.state.status
    const identifier = status?.identifier
    const createdAt = status?.createdAt

    if (!identifier && !createdAt) {
      return null
    }

    return (
      <span className="BlessingOAuth-Account-meta">
        {identifier
          ? app.translator.trans(`${PREFIX}.identifier`, { identifier })
          : null}
        {identifier && createdAt ? ' · ' : null}
        {createdAt
          ? app.translator.trans(`${PREFIX}.linked_at`, {
              time: humanTime(new Date(createdAt)),
            })
          : null}
      </span>
    )
  }

  private unlinkedActions(): Mithril.Children {
    return (
      <Button
        className="Button BlessingOAuth-Account-bind"
        onclick={() => this.startLink()}
      >
        {app.translator.trans(`${PREFIX}.bind_button`)}
      </Button>
    )
  }

  private linkedActions(): Mithril.Children {
    return [
      <Button
        className="Button"
        onclick={() => this.startLink()}
        disabled={this.state.unlinking}
      >
        {app.translator.trans(`${PREFIX}.rebind_button`)}
      </Button>,
      <Button
        className="Button"
        onclick={() => this.unlink()}
        loading={this.state.unlinking}
      >
        {app.translator.trans(`${PREFIX}.unbind_button`)}
      </Button>,
    ]
  }

  private startLink(): void {
    const baseUrl = String(
      app.forum.attribute<string>('baseUrl') ?? '',
    ).replace(/\/+$/, '')
    const returnTo = `${window.location.pathname}${window.location.search}`

    window.location.href = `${baseUrl}${LINK_PATH}?link=1&returnTo=${encodeURIComponent(
      returnTo,
    )}`
  }

  private async unlink(): Promise<void> {
    if (
      !confirm(extractText(app.translator.trans(`${PREFIX}.unlink_confirm`)))
    ) {
      return
    }

    this.state.unlinking = true
    m.redraw()

    try {
      await app.request({
        method: 'DELETE',
        url: `${app.forum.attribute<string>('apiUrl')}${LINK_STATUS_ENDPOINT}`,
      })

      this.state.status = {
        linked: false,
        identifier: null,
        createdAt: null,
        lastLoginAt: null,
      }

      app.alerts.show(
        { type: 'success' },
        app.translator.trans(`${PREFIX}.unlinked_success`),
      )
    } catch {
      app.alerts.show(
        { type: 'error' },
        app.translator.trans(`${PREFIX}.unlink_failed`),
      )
    } finally {
      this.state.unlinking = false
      m.redraw()
    }
  }

  private async load(): Promise<void> {
    if (!app.forum.attribute<boolean>(ENABLED_ATTRIBUTE)) {
      this.state.loading = false
      this.state.failed = false

      return
    }

    this.state.loading = true
    this.state.failed = false
    m.redraw()

    try {
      this.state.status = await app.request<IBlessingLinkStatus>({
        method: 'GET',
        url: `${app.forum.attribute<string>('apiUrl')}${LINK_STATUS_ENDPOINT}`,
      })
    } catch {
      this.state.failed = true
    } finally {
      this.state.loading = false
      m.redraw()
    }
  }
}
