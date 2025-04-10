import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get parameters for the OG image
    const username = searchParams.get('username') || '';
    
    // Check if followers parameter exists or try to use the random value as followers
    let followersCount = searchParams.get('followers');
    
    if (!followersCount) {
      // If there's no followers parameter, check for a numeric parameter (the random value)
      // and use it to get the follower count from page param or Url state
      const keys = Array.from(searchParams.keys());
      for (const key of keys) {
        if (key !== 'username' && !Number.isNaN(Number(searchParams.get(key)))) {
          // If we find a random numeric parameter, let's take it from preview path parts
          // This is a simplified approach - in production, you might want to fetch the actual count
          const previewPath = request.headers.get('referer') ?? '';
          const match = previewPath.match(/\/preview\/[^-]+-(\d+)/);
          if (match?.[1]) {
            followersCount = match[1];
            break;
          }
        }
      }
    }
    
    // Default to 0 if still no followers count
    followersCount = followersCount || '0';
    
    // フォロワー数を整形
    const formattedFollowers = Number.parseInt(followersCount, 10).toLocaleString();
    
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: 'white',
            fontFamily: 'sans-serif',
            padding: '40px 20px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 背景の装飾要素 */}
          <div
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0) 70%)',
              transform: 'translate(30%, -30%)',
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)',
              transform: 'translate(-30%, 30%)',
              zIndex: 1,
            }}
          />
          
          {/* メインコンテンツ - サイズ拡大 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '50px',
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              width: '90%',
              maxWidth: '1000px',
              position: 'relative',
              zIndex: 2,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* ヘッダー部分 - シンプル化 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                position: 'absolute',
                top: '30px',
                left: '30px',
                zIndex: 3,
              }}
            >
              {/* Verified by PRWi.re */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 18px',
                borderRadius: '14px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: '#3B82F6',
                  marginRight: '10px',
                }} />
                <p style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold',
                  margin: 0, 
                  color: '#A0AEC0'
                }}>
                  Verified by PRWi.re
                </p>
              </div>
              
              {/* X Username */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 18px',
                borderRadius: '14px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                {/* X logo as a simple path without text */}
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px', 
                  height: '20px', 
                  marginRight: '10px' 
                }}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#FFFFFF"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.14l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <p style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold',
                  margin: 0, 
                  color: '#FFFFFF'
                }}>
                  @{username}
                </p>
              </div>
            </div>
            
            {/* フォロワー数（中央大きく表示、太字化） */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '30px',
              marginTop: '50px',
            }}>
              <h2 style={{ 
                fontSize: '160px', 
                fontWeight: '1000', 
                margin: '0 0 15px 0',
                color: '#3B82F6',
                textShadow: '0 4px 30px rgba(59, 130, 246, 0.8)',
                lineHeight: '1',
                letterSpacing: '-2px',
                fontStretch: 'expanded',
              }}>
                {formattedFollowers}
              </h2>
              <p style={{ 
                fontSize: '44px', 
                margin: '0', 
                color: '#CBD5E0',
                fontWeight: '800',
              }}>
                Followers
              </p>
            </div>
          </div>
          
          {/* フッター部分 */}
          <div style={{ 
            position: 'absolute', 
            bottom: '25px', 
            right: '30px', 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 3,
          }}>
            <p style={{ 
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#CBD5E0',
              margin: 0,
            }}>
              verify.prwi.re
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response(`Error generating OG image: ${error}`, {
      status: 500,
    });
  }
} 