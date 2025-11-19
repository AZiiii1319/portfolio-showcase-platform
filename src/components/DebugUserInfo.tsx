import { useAuth } from '../contexts/AuthContext'

export function DebugUserInfo() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="fixed top-0 left-0 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded m-4 z-50">
        <strong>Debug:</strong> Loading auth state...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="fixed top-0 left-0 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4 z-50">
        <strong>Debug:</strong> No user logged in
        <br />
        <small>Please login to see user ID</small>
      </div>
    )
  }

  return (
    <div className="fixed top-0 left-0 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded m-4 z-50 max-w-md">
      <strong>Debug - User Info:</strong>
      <br />
      <strong>User ID:</strong> <code className="bg-white px-1 rounded">{user.id}</code>
      <br />
      <strong>Email:</strong> {user.email}
      <br />
      <strong>Profile:</strong> {profile ? profile.username : 'No profile'}
      <br />
      <button 
        onClick={() => {
          console.log('User ID:', user.id)
          console.log('Full User:', user)
          console.log('Profile:', profile)
          navigator.clipboard.writeText(user.id)
          alert('User ID copied to clipboard!')
        }}
        className="mt-2 bg-green-500 text-white px-2 py-1 rounded text-xs"
      >
        Copy User ID
      </button>
    </div>
  )
}