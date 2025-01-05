'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const DEFAULT_VIDEO_ID = 'yajJ_QVIKwU'

export default function YouTubePlayer() {
  const [youtubeLink, setYoutubeLink] = useState('')
  const [videoId, setVideoId] = useState(DEFAULT_VIDEO_ID)

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = extractVideoId(youtubeLink)
    if (id) {
      setVideoId(id)
      setYoutubeLink('')
    } else {
      alert('Invalid YouTube URL')
    }
  }

  return (
    <Card className="h-full bg-card">
      <CardHeader>
        <CardTitle>YouTube Player</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <form onSubmit={handleSubmit} className="space-y-2">
            <Input
              type="text"
              placeholder="Enter YouTube link"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              className="bg-input"
            />
            <Button type="submit" className="w-full">Load YouTube Video</Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

