// URLs das faixas de áudio — preencher com links do freetouse.com ou similar.
// Ambos devem ser arquivos de loop limpo (sem início/fim abrupto).

export const AUDIO_TRACKS = {
  home: 'https://data.freetouse.com/music/tracks/02f2dae0-5a1c-4e63-80d2-da388a488fb0/file/mp3',
  training: 'https://data.freetouse.com/music/tracks/a20b95a4-085b-ee46-f009-d7583890d296/file/mp3' 
} as const;

export const AUDIO_VOLUME = {
  home:     0.20, // ambiente leve — tela inicial
  training: 0.18, // ainda mais discreto — não competir com a leitura
} as const;

export type AudioTrack = keyof typeof AUDIO_TRACKS;
