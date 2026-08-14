import { Button, Modal } from './ui'
import { motion } from 'motion/react'
import { Award, Check, Sparkles, TrendingUp } from 'lucide-react'
import type { Reward } from '../lib/types'

export function RewardModal({ reward, onClose }: { reward: Reward | null; onClose: () => void }) {
  if (!reward) return null

  return (
    <Modal.Backdrop isOpen onOpenChange={(open) => !open && onClose()}>
      <Modal.Container placement="center" size="sm">
        <Modal.Dialog className="reward-dialog">
          <Modal.CloseTrigger />
          <>
                <Modal.Header>
                  <motion.div
                    className="reward-icon"
                    initial={{ scale: 0.6, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  >
                    <Check size={27} />
                  </motion.div>
                  <Modal.Heading>Progress made.</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <motion.div
                    className="xp-reward"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                  >
                    <Sparkles size={20} /> +{reward.xpGained} XP
                  </motion.div>
                  <div className="reward-stats">
                    {reward.goalProgress !== null && (
                      <div><TrendingUp size={17} /><span>Goal progress</span><strong>{reward.goalProgress}%</strong></div>
                    )}
                    <div><Sparkles size={17} /><span>Kaizen Score</span><strong>{reward.kaizenScore}</strong></div>
                    <div><Award size={17} /><span>Current level</span><strong>{reward.level}</strong></div>
                  </div>
                  {reward.leveledUp && <p className="level-up-note">Level up — you reached level {reward.level}.</p>}
                  {reward.achievements.map((achievement) => (
                    <div className="achievement-unlock" key={achievement.id}>
                      <Award size={18} />
                      <div><strong>{achievement.name}</strong><span>{achievement.description}</span></div>
                    </div>
                  ))}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="primary" className="w-full" onClick={onClose}>Keep moving</Button>
                </Modal.Footer>
          </>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
