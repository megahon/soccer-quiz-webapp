import { getTeams, getNotices } from '@/lib/db'
import { DEFAULT_TEAMS } from '@/lib/defaultData'
import QuizApp from '@/components/QuizApp'

export default async function Page() {
  const [teamsData, noticesData] = await Promise.all([
    getTeams(),
    getNotices(),
  ])

  return (
    <QuizApp
      teams={teamsData ?? DEFAULT_TEAMS}
      notices={noticesData ?? []}
    />
  )
}
