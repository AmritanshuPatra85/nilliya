'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type MediaFile = {
  name: string
  url: string
  isVideo: boolean
}

export default function GallerySection() {
  const [media, setMedia] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<MediaFile | null>(null)

  useEffect(() => {
    const fetchGallery = async () => {
      const supabase = createClient()
      const { data } = await supabase.storage.from('gallery').list()
      if (data) {
        const files = data
          .filter(f => f.name !== '.emptyFolderPlaceholder')
          .map(f => {
            const { data: urlData } = supabase.storage
              .from('gallery')
              .getPublicUrl(f.name)
            return {
              name: f.name,
              url: urlData.publicUrl,
              isVideo: f.name.match(/\.(mp4|mov|webm)$/i) !== null,
            }
          })
        const sorted = [
          ...files.filter(f => f.isVideo),
          ...files.filter(f => !f.isVideo),
        ]
        setMedia(sorted)
      }
      setLoading(false)
    }
    fetchGallery()
  }, [])

  return (
    <section id="gallery" className="py-24 bg-[#65222A]">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-16">
          <p className="text-[#A09C97] text-xs tracking-[0.4em] uppercase mb-4">Our Work</p>
          <h2 className="text-[#EEF4FF] font-serif text-5xl md:text-6xl font-light tracking-wide mb-4">
            Gallery
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-[#A09C97]/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#A09C97]" />
            <div className="h-px w-16 bg-[#A09C97]/50" />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-[#A09C97] tracking-widest uppercase text-sm py-20">
            Loading...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {media.map((file, index) => (
              <div
                key={file.name}
                onClick={() => setLightbox(file)}
                className={`cursor-pointer overflow-hidden group relative ${
                  index === 0 && file.isVideo ? 'col-span-2 row-span-2' : ''
                }`}
              >
                {file.isVideo ? (
                  <div className="relative w-full h-full min-h-[300px]">
                    <video
                      src={file.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all duration-300">
                      <div className="w-14 h-14 rounded-full border-2 border-[#EEF4FF] flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[16px] border-l-[#EEF4FF] border-b-[8px] border-b-transparent ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative overflow-hidden aspect-square">
                    <img
                      src={file.url}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-[#532332]/0 group-hover:bg-[#532332]/20 transition-all duration-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 text-[#EEF4FF] text-3xl hover:text-white"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
          {lightbox.isVideo ? (
            <video
              src={lightbox.url}
              controls
              autoPlay
              className="max-w-4xl max-h-[85vh] w-full"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <img
              src={lightbox.url}
              alt="Gallery"
              className="max-w-4xl max-h-[85vh] object-contain"
              onClick={e => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </section>
  )
}