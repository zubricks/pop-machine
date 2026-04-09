'use client'

import React, { useState, useCallback } from 'react'
import styles from './styles.module.css'

type Product = {
  id: string
  name: string
  color: string
  price: number
  stock: number
  position: number
}

type Props = {
  initialProducts: Product[]
}

export default function VendingMachine({ initialProducts }: Props) {
  const [balance, setBalance] = useState(0)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [dispensing, setDispensing] = useState<string | null>(null)
  const [displayText, setDisplayText] = useState('INSERT COINS')
  const [isShaking, setIsShaking] = useState(false)
  const [isSoldOutDisplay, setIsSoldOutDisplay] = useState(false)

  const insertCoin = useCallback(() => {
    setBalance((prev) => {
      const next = prev + 25
      setDisplayText(`$${(next / 100).toFixed(2)}`)
      return next
    })
  }, [])

  const selectSoda = useCallback(
    async (product: Product) => {
      if (product.stock <= 0) {
        setIsShaking(true)
        setIsSoldOutDisplay(true)
        setDisplayText('SOLD OUT')
        setTimeout(() => {
          setIsShaking(false)
          setIsSoldOutDisplay(false)
          setDisplayText(balance > 0 ? `$${(balance / 100).toFixed(2)}` : 'INSERT COINS')
        }, 1500)
        return
      }

      if (balance < product.price) {
        setIsShaking(true)
        setIsSoldOutDisplay(true)
        setDisplayText('INSERT COINS')
        setTimeout(() => {
          setIsShaking(false)
          setIsSoldOutDisplay(false)
          setDisplayText(balance > 0 ? `$${(balance / 100).toFixed(2)}` : 'INSERT COINS')
        }, 1500)
        return
      }

      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: p.stock - 1 } : p)),
      )
      setBalance((prev) => {
        const next = prev - product.price
        setDisplayText(next > 0 ? `$${(next / 100).toFixed(2)}` : 'THANK YOU!')
        return next
      })
      setDispensing(product.color)
      setTimeout(() => setDispensing(null), 1000)

      // Real API call
      try {
        const res = await fetch('/api/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        })
        const data = await res.json()

        if (!data.success) {
          // Rollback
          setProducts((prev) =>
            prev.map((p) => (p.id === product.id ? { ...p, stock: p.stock + 1 } : p)),
          )
          setBalance((prev) => prev + product.price)
          setDisplayText('TRY AGAIN')
          setTimeout(() => setDisplayText('INSERT COINS'), 1500)
        } else {
          // Sync authoritative stock
          setProducts((prev) =>
            prev.map((p) => (p.id === product.id ? { ...p, stock: data.remaining } : p)),
          )
        }
      } catch {
        // Network error rollback
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, stock: p.stock + 1 } : p)),
        )
      }

      setTimeout(() => {
        setBalance((currentBalance) => {
          if (currentBalance <= 0) setDisplayText('INSERT COINS')
          return currentBalance
        })
      }, 2000)
    },
    [balance],
  )

  const sorted = [...products].sort((a, b) => a.position - b.position)

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.machine} ${isShaking ? styles.shaking : ''}`}>
        <div className={styles.topPanel}>
          <div className={styles.brandPanel}>
            <span className={styles.brandEnjoy}>Enjoy</span>
            <img src="/payload-logo-white.svg" alt="Payload" className={styles.brandLogo} />
            <span className={styles.brandSub}>POP</span>
          </div>

          <div className={styles.controlsPanel}>
            <div className={styles.coinAcceptor}>
              <div className={styles.coinLabel}>Coin Acceptor</div>
              <button className={styles.coinSlot} onClick={insertCoin}>
                <span className={styles.coinSlotLabel}>INSERT COIN</span>
                <span className={styles.coinSlotIcon}>🪙</span>
              </button>
            </div>

            <div className={`${styles.display} ${isSoldOutDisplay ? styles.soldOut : ''}`}>
              {displayText}
            </div>

            <div className={styles.buttonGrid}>
              {sorted.map((product) => {
                const isOut = product.stock <= 0

                return (
                  <button
                    key={product.id}
                    className={[
                      styles.sodaButton,
                      isOut ? styles.outOfStock : '',
                    ].join(' ')}
                    style={{ '--soda-color': product.color } as React.CSSProperties}
                    onClick={() => selectSoda(product)}
                  >
                    <div className={styles.sodaColorDot} style={{ background: product.color }} />
                    <span className={styles.sodaName}>{product.name}</span>
                    <span className={styles.sodaPrice}>${(product.price / 100).toFixed(2)}</span>
                    <span className={styles.sodaStock}>
                      {isOut ? '—' : `${product.stock} left`}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className={styles.tray}>
          {dispensing && <div className={styles.can} style={{ background: dispensing }} />}
          <div className={styles.trayOpening} />
        </div>
      </div>
    </div>
  )
}
