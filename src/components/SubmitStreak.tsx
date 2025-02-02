import { useState, useTransition } from 'react'
import { Loader2, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Turnstile } from '@marsidev/react-turnstile'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { saveStreak } from '@/app/actions'
import { toast } from 'sonner'
import {
	RegExpMatcher,
	englishDataset,
	englishRecommendedTransformers,
} from 'obscenity'

export function SubmitStreak({
	streak,
	isDealing,
	onSubmit,
}: {
	streak: number
	isDealing: boolean
	onSubmit: () => void
}) {
	const [playerName, setPlayerName] = useState('')
	const [token, setToken] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()

	const matcher = new RegExpMatcher({
		...englishDataset.build(),
		...englishRecommendedTransformers,
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!token) {
			toast.error('Please wait for verification')
			return
		}
		startTransition(async () => {
			if (streak > 0 && playerName) {
				const matches = matcher.getAllMatches(playerName)
				if (matches.length > 0) {
					toast.error('Please use another name.')
					return
				}
				await saveStreak(streak, playerName)
				toast.success(`Your streak of ${streak} has been submitted!`)
				onSubmit()
			}
		})
	}

	return (
		<Popover
			onOpenChange={open => {
				if (!open) {
					setToken(null)
				}
			}}
		>
			<PopoverTrigger asChild>
				<Button
					disabled={isDealing}
					className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-none py-6 px-8 rounded-lg text-lg transition-all duration-200"
				>
					<Trophy className="size-6" />
					Submit Streak
				</Button>
			</PopoverTrigger>
			<PopoverContent
				side="top"
				className="w-full bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700 p-4 rounded-xl shadow-xl"
			>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Input
							id="name"
							type="text"
							placeholder="Name"
							value={playerName}
							maxLength={25}
							required
							onChange={e => setPlayerName(e.target.value)}
							className="bg-gray-700 mt-1 text-white border-gray-600 focus:border-blue-500"
						/>
					</div>
					<Turnstile
						siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
						onSuccess={setToken}
						className="!mt-0"
					/>
					<Button
						type="submit"
						disabled={isPending || isDealing || !token}
						className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white transition-all duration-200"
					>
						{isPending || !token ? (
							<div className="flex items-center justify-center gap-2">
								<Loader2 className="animate-spin" />
								Verifying...
							</div>
						) : (
							`Publish ${streak} Win${streak > 1 ? 's' : ''}`
						)}
					</Button>
				</form>
			</PopoverContent>
		</Popover>
	)
}
