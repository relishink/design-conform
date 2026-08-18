import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import Library from './routes/Library'
import Prototypes from './routes/Prototypes'
import Prototype from './routes/Prototype'
import Standards from './routes/Standards'
import Settings from './routes/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/library" replace />} />
        <Route path="/library" element={<Library />} />
        <Route path="/library/:componentId" element={<Library />} />
        <Route path="/prototypes" element={<Prototypes />} />
        <Route path="/prototypes/:id" element={<Prototype />} />
        <Route path="/standards" element={<Standards />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/library" replace />} />
      </Route>
    </Routes>
  )
}
