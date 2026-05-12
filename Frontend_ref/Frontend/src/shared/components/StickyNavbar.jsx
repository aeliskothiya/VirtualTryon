import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppContext } from '../../app/AppContext'

const navItems = [
	{ key: 'overview', label: 'Dashboard' },
	{ key: 'wardrobe', label: 'Wardrobe' },
	{ key: 'recommendations', label: 'Recommendations' },
	{ key: 'tryon', label: 'Try-On' },
	{ key: 'activity', label: 'Activity' },
]

export function StickyNavbar({ currentPage = 'overview', onNavigate = () => {} }) {
	const { logout, session } = useAppContext()
	const [menuOpen, setMenuOpen] = useState(false)
	const [profileOpen, setProfileOpen] = useState(false)
	const [coinDisplay, setCoinDisplay] = useState(0)
	const profileRef = useRef(null)

	const coinBalance = Number(session.user?.coin_balance ?? 0)
	const initials = useMemo(() => {
		const name = session.user?.name || session.user?.email || 'U'
		return String(name).trim().slice(0, 1).toUpperCase()
	}, [session.user?.name, session.user?.email])

	useEffect(() => {
		setCoinDisplay(coinBalance)
	}, [])

	useEffect(() => {
		const start = coinDisplay
		const end = coinBalance

		if (start === end) {
			return
		}

		const duration = 500
		const startedAt = performance.now()
		let frame = 0

		const tick = (now) => {
			const progress = Math.min((now - startedAt) / duration, 1)
			const eased = 1 - Math.pow(1 - progress, 3)
			setCoinDisplay(Math.round(start + (end - start) * eased))

			if (progress < 1) {
				frame = requestAnimationFrame(tick)
			}
		}

		frame = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(frame)
	}, [coinBalance])

	useEffect(() => {
		const onClickOutside = (event) => {
			if (!profileRef.current) {
				return
			}

			if (!profileRef.current.contains(event.target)) {
				setProfileOpen(false)
			}
		}

		window.addEventListener('mousedown', onClickOutside)
		return () => window.removeEventListener('mousedown', onClickOutside)
	}, [])

	function handleNavigate(page) {
		onNavigate(page)
		setMenuOpen(false)
	}

	return (
		<header className="sticky top-0 z-40 w-full border-b border-white/50 bg-stone-50/90 backdrop-blur-xl">
			<div className="mx-auto flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
				<button
					type="button"
					onClick={() => handleNavigate('overview')}
					className="group inline-flex items-center gap-3 rounded-2xl px-2 py-1 transition hover:bg-white/80"
				>
					<span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-950 text-sm font-semibold text-white shadow-sm transition group-hover:scale-105">
						FA
					</span>
					<span className="hidden text-left sm:block">
						<span className="block text-sm font-semibold text-stone-900">FashionAI</span>
						<span className="block text-[11px] uppercase tracking-[0.18em] text-stone-500">Virtual Try-On</span>
					</span>
				</button>

				<nav className="hidden items-center gap-1 lg:flex">
					{navItems.map((item) => (
						<button
							key={item.key}
							type="button"
							onClick={() => handleNavigate(item.key)}
							className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
								currentPage === item.key
									? 'bg-stone-900 text-white'
									: 'text-stone-700 hover:bg-white hover:text-stone-950'
							}`}
						>
							{item.label}
						</button>
					))}
				</nav>

				<div className="flex items-center gap-2 sm:gap-3">
					<div className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm">
						<span aria-hidden="true">🪙</span>
						<span className="font-semibold text-stone-900">{coinDisplay.toLocaleString()}</span>
					</div>

					<div ref={profileRef} className="relative">
						<button
							type="button"
							onClick={() => setProfileOpen((current) => !current)}
							className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-sm font-semibold text-stone-900 shadow-sm transition hover:scale-105"
							aria-expanded={profileOpen}
							aria-label="Open profile menu"
						>
							{initials}
						</button>

						{profileOpen ? (
							<div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg">
								<div className="border-b border-stone-100 px-4 py-3">
									<p className="truncate text-sm font-semibold text-stone-900">{session.user?.name || 'User'}</p>
									<p className="truncate text-xs text-stone-500">{session.user?.email}</p>
								</div>
								<button
									type="button"
									onClick={() => {
										handleNavigate('profile')
										setProfileOpen(false)
									}}
									className="w-full px-4 py-3 text-left text-sm text-stone-700 transition hover:bg-stone-50"
								>
									Profile
								</button>
								<button
									type="button"
									onClick={logout}
									className="w-full px-4 py-3 text-left text-sm text-rose-700 transition hover:bg-rose-50"
								>
									Log out
								</button>
							</div>
						) : null}
					</div>

					<button
						type="button"
						onClick={() => setMenuOpen((current) => !current)}
						className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-800 shadow-sm transition hover:bg-stone-50 lg:hidden"
						aria-expanded={menuOpen}
						aria-label="Open navigation menu"
					>
						☰
					</button>
				</div>
			</div>

			{menuOpen ? (
				<nav className="border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden sm:px-6">
					<div className="grid gap-2">
						{navItems.map((item) => (
							<button
								key={item.key}
								type="button"
								onClick={() => handleNavigate(item.key)}
								className={`rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
									currentPage === item.key
										? 'bg-stone-900 text-white'
										: 'text-stone-700 hover:bg-stone-100'
								}`}
							>
								{item.label}
							</button>
						))}
					</div>
				</nav>
			) : null}
		</header>
	)
}
