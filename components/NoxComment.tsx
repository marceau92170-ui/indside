'use client'
import { motion } from 'framer-motion'
import Nox from './Nox'

interface NoxCommentProps {
  comment: string
  emotion?: 'curious' | 'intrigued' | 'amused' | 'surprised' | 'proud' | 'excited'
  size?: number
}

export default function NoxComment({ comment, emotion = 'curious', size = 56 }: NoxCommentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '10px',
        padding: '4px 0',
      }}
    >
      <Nox emotion={emotion} size={size} />
      <motion.div
        initial={{ opacity: 0, x: -8, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '16px 16px 16px 4px',
          padding: '10px 14px',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'rgba(240,240,245,0.85)',
          maxWidth: '200px',
          lineHeight: 1.4,
        }}
      >
        {comment}
      </motion.div>
    </motion.div>
  )
}
