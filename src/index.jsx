import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import styled, { css } from 'styled-components'
import { BaseModalBackground } from './baseStyles'

let modalNode = null
let BackgroundComponent = BaseModalBackground

class ModalProvider extends Component {
  componentDidMount () {
    if (this.props.backgroundComponent) {
      BackgroundComponent = this.props.backgroundComponent
    }
  }

  render () {
    return (
      <React.Fragment>
        {this.props.children}
        <div ref={node => { modalNode = node }} />
      </React.Fragment>
    )
  }
}

class Modal extends Component {
  constructor (props) {
    super(props)

    this.node = null
    this.InnerStyles = styled.div`${props.styles}` || styled.div``
    this.prevBodyOverflow = null

    this.onKeydown = this.onKeydown.bind(this)
    this.onBackgroundClick = this.onBackgroundClick.bind(this)
    this.cleanUp = this.cleanUp.bind(this)
  }

  static styled (...args) {
    const styles = css(...args)
    return class __StyledModal extends Component {
      render () {
        return <Modal styles={styles} {...this.props} />
      }
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.isOpen !== this.props.isOpen) {
      if (!this.props.isOpen) {
        modalNode && this.node && modalNode.removeChild(this.node)
        this.cleanUp()
      } else if (this.props.isOpen) {
        document.addEventListener('keydown', this.onKeydown)

        if (!this.props.allowScroll) {
          this.prevBodyOverflow = document.body.style.overflow
          document.body.style.overflow = 'hidden'
        }
      }
    }
  }

  componentWillUnmount () {
    if (this.props.isOpen) this.cleanUp()
  }

  cleanUp () {
    document.removeEventListener('keydown', this.onKeydown)

    if (!this.props.allowScroll) {
      document.body.style.overflow = this.prevBodyOverflow || ''
    }
  }

  onKeydown (e) {
    if (e.key === 'Escape') {
      this.props.onEscapeKeydown && this.props.onEscapeKeydown(e)
    }
  }

  onBackgroundClick (e) {
    if (this.node === e.target) {
      this.props.onBackgroundClick && this.props.onBackgroundClick(e)
    }
  }

  render () {
    const { isOpen, children, ...rest } = this.props

    if (isOpen) {
      return ReactDOM.createPortal((
        <BackgroundComponent
          onClick={this.onBackgroundClick}
          innerRef={node => { this.node = node }}>
          <this.InnerStyles {...rest}>
            {children}
          </this.InnerStyles>
        </BackgroundComponent>
      ), modalNode)
    } else {
      return null
    }
  }
}

export default Modal
export { ModalProvider, BaseModalBackground }
