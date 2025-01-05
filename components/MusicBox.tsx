'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'

export default function MusicBox() {
  const [youtubeLink, setYoutubeLink] = useState('')

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Music Player</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Now Playing</h3>
          <p className="text-sm text-gray-500 mb-4">Artist - Song Name</p>
          <div className="flex justify-center space-x-2 mb-4">
            <Button size="icon" variant="outline">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline">
              <Play className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline">
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          <Input
            type="text"
            placeholder="Enter YouTube link"
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
            className="mb-2"
          />
          <Button className="w-full">Load YouTube Video</Button>
        </div>
      </CardContent>
    </Card>
  )
}

