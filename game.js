const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Cấu hình game
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const PADDLE_SPEED = 5;
const BALL_RADIUS = 10;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 80;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_TOP_OFFSET = 50;
const BRICK_LEFT_OFFSET = 35;
const POWERUP_SIZE = 20;
const POWERUP_SPEED = 2;
const MAX_LEVEL = 15;

// Khai báo BRICK_COLORS
const BRICK_COLORS = [
    {color: '#808080', strength: Infinity}, // Gạch không thể phá vỡ
    {color: '#FF0000', strength: 4}, // Đỏ: 4 lần đập
    {color: '#FFA500', strength: 3}, // Cam: 3 lần đập
    {color: '#FFFF00', strength: 2}, // Vàng: 2 lần đập
    {color: '#00FF00', strength: 1}, // Xanh lá: 1 lần đập
];

// Định nghĩa các mẫu level (0: không có gạch, 1-4: gạch thường, 9: gạch không thể phá)
const LEVEL_PATTERNS = {
    1: [ // Hình chữ V đơn giản
        [9,1,1,0,0,1,1,9],
        [0,2,0,0,0,0,2,0],
        [0,0,3,0,0,3,0,0],
        [0,0,0,4,4,0,0,0],
        [9,0,0,0,0,0,0,9]
    ],
    2: [ // Hình trái tim
        [9,2,2,0,0,2,2,9],
        [2,3,3,2,2,3,3,2],
        [2,3,3,3,3,3,3,2],
        [0,2,3,3,3,3,2,0],
        [9,0,2,3,3,2,0,9]
    ],
    3: [ // Tường thành
        [9,1,1,9,9,1,1,9],
        [1,2,2,2,2,2,2,1],
        [1,2,3,3,3,3,2,1],
        [1,2,2,2,2,2,2,1],
        [9,1,1,9,9,1,1,9]
    ],
    4: [ // Mê cung
        [9,9,1,1,1,1,9,9],
        [9,2,2,9,9,2,2,9],
        [1,2,3,2,2,3,2,1],
        [1,2,2,3,3,2,2,1],
        [9,1,1,9,9,1,1,9]
    ],
    5: [ // Số 8
        [9,2,2,2,2,2,2,9],
        [2,9,3,3,3,3,9,2],
        [2,3,9,4,4,9,3,2],
        [2,9,3,3,3,3,9,2],
        [9,2,2,2,2,2,2,9]
    ],
    6: [ // Mũi tên
        [9,0,0,4,4,0,0,9],
        [0,0,3,3,3,3,0,0],
        [0,2,2,9,9,2,2,0],
        [1,1,1,9,9,1,1,1],
        [9,9,9,9,9,9,9,9]
    ],
    7: [ // Đường hầm
        [9,9,9,0,0,9,9,9],
        [9,3,2,1,1,2,3,9],
        [4,3,2,1,1,2,3,4],
        [9,3,2,1,1,2,3,9],
        [9,9,9,0,0,9,9,9]
    ],
    8: [ // Chữ X
        [9,9,3,2,2,3,9,9],
        [9,3,9,2,2,9,3,9],
        [3,9,2,9,9,2,9,3],
        [9,3,9,2,2,9,3,9],
        [9,9,3,2,2,3,9,9]
    ],
    9: [ // Lâu đài
        [9,9,2,9,9,2,9,9],
        [9,3,3,3,3,3,3,9],
        [2,3,9,3,3,9,3,2],
        [2,3,3,3,3,3,3,2],
        [9,2,2,9,9,2,2,9]
    ],
    10: [ // Xoắn ốc
        [9,4,4,4,4,4,4,9],
        [4,9,9,9,9,9,9,4],
        [4,9,2,2,2,2,9,4],
        [4,9,9,9,9,2,9,4],
        [9,3,3,3,3,3,3,9]
    ],
    11: [ // Kim cương kép
        [9,0,3,9,9,3,0,9],
        [0,3,4,3,3,4,3,0],
        [3,4,9,4,4,9,4,3],
        [0,3,4,3,3,4,3,0],
        [9,0,3,9,9,3,0,9]
    ],
    12: [ // Pháo đài
        [9,4,4,9,9,4,4,9],
        [4,3,3,4,4,3,3,4],
        [4,3,9,3,3,9,3,4],
        [4,3,3,9,9,3,3,4],
        [9,4,4,9,9,4,4,9]
    ],
    13: [ // Ma trận
        [9,4,9,4,4,9,4,9],
        [4,9,4,9,9,4,9,4],
        [9,4,9,4,4,9,4,9],
        [4,9,4,9,9,4,9,4],
        [9,4,9,4,4,9,4,9]
    ],
    14: [ // Ngôi sao
        [9,0,4,9,9,4,0,9],
        [0,4,3,4,4,3,4,0],
        [4,3,9,3,3,9,3,4],
        [9,4,3,9,9,3,4,9],
        [9,4,3,9,9,3,4,9]
    ],
    15: [ // Boss level
        [9,4,9,4,4,9,4,9],
        [4,4,4,9,9,4,4,4],
        [9,4,9,4,4,9,4,9],
        [4,9,4,9,9,4,9,4],
        [9,4,9,4,4,9,4,9]
    ]
};

// Khai báo POWERUP_TYPES
const POWERUP_TYPES = {
    ENLARGE_PADDLE: {
        color: '#FFD700',
        symbol: 'P+',
        effect: () => {
            paddle.width = PADDLE_WIDTH * 1.5;
            setTimeout(() => {
                paddle.width = PADDLE_WIDTH;
            }, 10000);
        }
    },
    SLOW_BALL: {
        color: '#87CEEB',
        symbol: 'S',
        effect: () => {
            const oldSpeed = ball.speed;
            ball.speed *= 0.7;
            ball.dx *= 0.7;
            ball.dy *= 0.7;
            setTimeout(() => {
                ball.speed = oldSpeed;
                ball.dx = (ball.dx / 0.7) * (ball.dx > 0 ? 1 : -1);
                ball.dy = (ball.dy / 0.7) * (ball.dy > 0 ? 1 : -1);
            }, 10000);
        }
    },
    EXTRA_LIFE: {
        color: '#FF69B4',
        symbol: '♥',
        effect: () => {
            if (lives < 3) lives++;
        }
    }
};

// Thêm vào phần đầu file với các const khác
const INITIAL_LIVES = 5;

// Sửa lại phần khai báo biến trạng thái game
let currentLevel = 1;
let lives = INITIAL_LIVES;  // Thay đổi từ 3 thành INITIAL_LIVES
let gameOver = false;
let ballOnPaddle = true;
let powerups = [];
let bricks = [];
let score = 0;
let combo = 0;
let lastBrickTime = 0;
const COMBO_TIMEOUT = 1000; // Thời gian giữa 2 lần đập để tính combo (1 giây)
const BASE_BRICK_SCORE = 10; // Điểm cơ bản cho mỗi viên gạch
const COMBO_BONUS = 5; // Điểm thưởng tăng thêm cho mỗi combo

// Thêm biến cho animation combo
let comboAnimations = [];

// Tạo class cho animation combo
class ComboAnimation {
    constructor(x, y, combo) {
        this.x = x;
        this.y = y;
        this.combo = combo;
        this.life = 1.0;
        this.scale = 0.5;
        this.rotation = -15 + Math.random() * 30;
        this.dx = -2 + Math.random() * 4;
        this.glow = 20; // Thêm biến cho hiệu ứng glow
    }

    update() {
        this.life -= 0.02;
        this.y -= 2;
        this.x += this.dx;

        // Hiệu ứng scale mượt hơn
        if (this.scale < 1.2) {
            this.scale += 0.1;
        }

        this.dx *= 0.95;
        this.rotation *= 0.95;

        // Hiệu ứng glow nhấp nháy
        this.glow = 20 + Math.sin(Date.now() / 100) * 10;
    }

    draw(ctx) {
        ctx.save();

        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.scale(this.scale, this.scale);

        // Hiệu ứng glow
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = this.glow;

        // Vẽ số combo
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Vẽ outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.font = 'bold 28px "Press Start 2P"';
        ctx.strokeText(`${this.combo}×`, 0, 0);

        // Vẽ gradient cho số
        const gradient = ctx.createLinearGradient(0, -15, 0, 15);
        gradient.addColorStop(0, '#FFD700'); // Vàng
        gradient.addColorStop(0.5, '#FFA500'); // Cam
        gradient.addColorStop(1, '#FF8C00'); // Cam đậm
        ctx.fillStyle = gradient;
        ctx.fillText(`${this.combo}×`, 0, 0);

        // Vẽ chữ COMBO
        ctx.font = 'bold 16px "Press Start 2P"';
        ctx.fillStyle = '#FFF';
        ctx.shadowBlur = this.glow / 2;
        ctx.fillText('COMBO!', 0, 20);

        // Thêm hiệu ứng tỏa sáng
        ctx.globalAlpha = this.life * 0.3;
        ctx.beginPath();
        ctx.arc(0, 0, 40 * this.scale, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
        ctx.fill();

        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

// Tạo sprite bằng canvas
function createSprite(width, height, drawFunction) {
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = width;
    spriteCanvas.height = height;
    const spriteCtx = spriteCanvas.getContext('2d');
    drawFunction(spriteCtx);
    const image = new Image();
    image.src = spriteCanvas.toDataURL();
    return image;
}

// Tạo các sprite
const SPRITES = {
    ball: createSprite(20, 20, (ctx) => {
        // Vẽ quả bóng phát sáng
        const gradient = ctx.createRadialGradient(10, 10, 0, 10, 10, 10);
        gradient.addColorStop(0, '#FFF');
        gradient.addColorStop(0.5, '#0095DD');
        gradient.addColorStop(1, '#006699');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(10, 10, 8, 0, Math.PI * 2);
        ctx.fill();
    }),

    paddle: createSprite(100, 20, (ctx) => {
        // Vẽ paddle với hiệu ứng kim loại
        const gradient = ctx.createLinearGradient(0, 0, 0, 20);
        gradient.addColorStop(0, '#4DA6FF');
        gradient.addColorStop(0.5, '#0095DD');
        gradient.addColorStop(1, '#0066CC');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 100, 20);
        // Thêm viền sáng
        ctx.strokeStyle = '#99CCFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, 98, 18);
    }),

    bricks: {
        metal: createSprite(80, 20, (ctx) => {
            // Vẽ gạch kim loại không thể phá hủy
            const gradient = ctx.createLinearGradient(0, 0, 80, 20);
            gradient.addColorStop(0, '#999');
            gradient.addColorStop(0.5, '#666');
            gradient.addColorStop(1, '#333');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 80, 20);
            // Thêm điểm sáng
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(5, 2, 70, 8);
        }),

        red: createSprite(80, 20, (ctx) => {
            // Vẽ gạch đỏ
            ctx.fillStyle = '#FF4444';
            ctx.fillRect(0, 0, 80, 20);
            ctx.fillStyle = '#FF6666';
            ctx.fillRect(2, 2, 76, 8);
            ctx.strokeStyle = '#CC0000';
            ctx.strokeRect(0, 0, 80, 20);
        }),

        orange: createSprite(80, 20, (ctx) => {
            // Vẽ gạch cam
            ctx.fillStyle = '#FF9933';
            ctx.fillRect(0, 0, 80, 20);
            ctx.fillStyle = '#FFBB66';
            ctx.fillRect(2, 2, 76, 8);
            ctx.strokeStyle = '#CC6600';
            ctx.strokeRect(0, 0, 80, 20);
        }),

        yellow: createSprite(80, 20, (ctx) => {
            // Vẽ gạch vàng
            ctx.fillStyle = '#FFDD44';
            ctx.fillRect(0, 0, 80, 20);
            ctx.fillStyle = '#FFEE66';
            ctx.fillRect(2, 2, 76, 8);
            ctx.strokeStyle = '#CCAA00';
            ctx.strokeRect(0, 0, 80, 20);
        }),

        green: createSprite(80, 20, (ctx) => {
            // Vẽ gạch xanh
            ctx.fillStyle = '#44DD44';
            ctx.fillRect(0, 0, 80, 20);
            ctx.fillStyle = '#66EE66';
            ctx.fillRect(2, 2, 76, 8);
            ctx.strokeStyle = '#00AA00';
            ctx.strokeRect(0, 0, 80, 20);
        })
    },

    heart: createSprite(30, 30, (ctx) => {
        // Vẽ trái tim pixel
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(15, 25);
        ctx.quadraticCurveTo(15, 25, 7.5, 15);
        ctx.quadraticCurveTo(0, 5, 15, 5);
        ctx.quadraticCurveTo(30, 5, 22.5, 15);
        ctx.quadraticCurveTo(15, 25, 15, 25);
        ctx.fill();
        // Thêm điểm sáng
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(10, 10, 3, 0, Math.PI * 2);
        ctx.fill();
    }),

    background: createSprite(800, 600, (ctx) => {
        // Gradient nền
        const bgGradient = ctx.createLinearGradient(0, 0, 0, 600);
        bgGradient.addColorStop(0, '#000033');
        bgGradient.addColorStop(1, '#000066');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, 800, 600);

        // Vẽ các ngôi sao
        ctx.fillStyle = '#FFF';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 800;
            const y = Math.random() * 600;
            const size = Math.random() * 2 + 1;
            const alpha = Math.random() * 0.8 + 0.2;
            ctx.globalAlpha = alpha;
            ctx.fillRect(x, y, size, size);
        }
        ctx.globalAlpha = 1;

        // Vẽ lưới pixel
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let x = 0; x < 800; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 600);
            ctx.stroke();
        }
        for (let y = 0; y < 600; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(800, y);
            ctx.stroke();
        }

        // Thêm hiệu ứng ánh sáng ở giữa
        const centerGlow = ctx.createRadialGradient(400, 300, 0, 400, 300, 400);
        centerGlow.addColorStop(0, 'rgba(0, 150, 255, 0.1)');
        centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = centerGlow;
        ctx.fillRect(0, 0, 800, 600);
    }),
};

// Đối tượng paddle (thanh trượt)
const paddle = {
    x: canvas.width / 2 - PADDLE_WIDTH / 2,
    y: canvas.height - PADDLE_HEIGHT - 10,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: PADDLE_SPEED,
    dx: 0
};

// Đối tượng ball (quả bóng)
const ball = {
    x: canvas.width / 2,
    y: paddle.y - BALL_RADIUS,
    radius: BALL_RADIUS,
    speed: 2,
    dx: 2,
    dy: -2
};

// Sửa lại phần khai báo âm thanh
const SOUNDS = {
    hit: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'), // Âm thanh gạch vỡ
    bounce: new Audio('https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3'), // Âm thanh nảy mới
    powerup: new Audio('https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3'), // Âm thanh ăn item
    gameOver: new Audio('https://assets.mixkit.co/active_storage/sfx/2603/2603-preview.mp3'), // Âm thanh thua
    levelUp: new Audio('https://assets.mixkit.co/active_storage/sfx/2590/2590-preview.mp3'), // Âm thanh lên level
    loseLife: new Audio('https://assets.mixkit.co/active_storage/sfx/2620/2620-preview.mp3') // Âm thanh mất mạng
};

// iều chỉnh âm lượng riêng cho từng loại âm thanh
SOUNDS.hit.volume = 0.3;      // Âm thanh va chạm gạch
SOUNDS.bounce.volume = 0.15;   // Giảm âm lượng âm thanh nảy xuống vì âm thanh mới to hơn
SOUNDS.powerup.volume = 0.2;   // Âm thanh powerup
SOUNDS.gameOver.volume = 0.2;  // Âm thanh game over
SOUNDS.levelUp.volume = 0.2;   // Âm thanh level up
SOUNDS.loseLife.volume = 0.2;  // Âm thanh mất mạng

// Sửa lại hàm phát âm thanh để tránh lỗi khi phát nhiều lần
function playSound(soundName) {
    const sound = SOUNDS[soundName];
    if (sound) {
        // Clone âm thanh để có thể phát nhiều lần
        const soundClone = sound.cloneNode();
        soundClone.volume = sound.volume;
        soundClone.play().catch(error => {
            console.log("Lỗi phát âm thanh:", error);
        });
    }
}

// Hàm tạo gạch theo mẫu level
function createBricksForLevel(level) {
    const pattern = LEVEL_PATTERNS[level] || LEVEL_PATTERNS[1];
    let bricks = [];

    for (let row = 0; row < BRICK_ROWS; row++) {
        bricks[row] = [];
        for (let col = 0; col < BRICK_COLS; col++) {
            const brickType = pattern[row][col];
            if (brickType === 0) {
                // Không có gạch
                bricks[row][col] = {
                    visible: false
                };
            } else {
                // Tạo gạch với độ bền tương ứng
                const colorIndex = brickType === 9 ? 0 : brickType;
                bricks[row][col] = {
                    x: BRICK_LEFT_OFFSET + col * (BRICK_WIDTH + BRICK_PADDING),
                    y: BRICK_TOP_OFFSET + row * (BRICK_HEIGHT + BRICK_PADDING),
                    width: BRICK_WIDTH,
                    height: BRICK_HEIGHT,
                    strength: BRICK_COLORS[colorIndex].strength,
                    colorIndex: colorIndex,
                    visible: true
                };
            }
        }
    }
    return bricks;
}

// Thêm hàm kiểm tra hoàn thành level
function checkLevelComplete() {
    for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
            const brick = bricks[row][col];
            if (brick.visible && brick.strength !== Infinity) {
                return false;
            }
        }
    }
    return true;
}

// Xử lý phím
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// Kiểm tra va chạm
function collisionDetection() {
    // Va chạm với gạch
    let hitBrick = false; // Thêm biến kiểm tra có đập vào gạch không

    for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
            const brick = bricks[row][col];
            if (brick.visible) {
                if (ball.x + ball.radius > brick.x &&
                    ball.x - ball.radius < brick.x + brick.width &&
                    ball.y + ball.radius > brick.y &&
                    ball.y - ball.radius < brick.y + brick.height) {
                    ball.dy = -ball.dy;
                    hitBrick = true;

                    // Phát âm thanh
                    playSound('hit');

                    // Chỉ tính combo khi đập vào gạch có thể phá vỡ
                    if (!ballOnPaddle && brick.strength !== Infinity) {
                        addScore(0);

                        // Thêm animation combo nếu có combo
                        if (combo > 1) {
                            comboAnimations.push(new ComboAnimation(
                                brick.x + BRICK_WIDTH/2,
                                brick.y,
                                combo
                            ));
                        }
                    }

                    // Xử lý phá gạch và tính điểm
                    if (brick.strength !== Infinity) {
                        brick.strength--;
                        if (brick.strength > 0) {
                            brick.colorIndex = BRICK_COLORS.length - brick.strength;
                        } else {
                            brick.visible = false;
                            // Cộng điểm khi phá vỡ gạch
                            score += BASE_BRICK_SCORE + (combo * COMBO_BONUS);
                            // Tạo vật phẩm...
                        }
                    }
                }
            }
        }
    }

    // Va chạm với paddle
    if (ball.x + ball.radius > paddle.x &&
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.y + ball.radius > paddle.y) {

        // Tính toán vị trí va chạm trên paddle (từ -1 đến 1)
        const hitPoint = (ball.x - (paddle.x + paddle.width/2)) / (paddle.width/2);

        // Tính toán hệ số tăng tốc dựa vào khoảng cách từ giữa paddle
        const speedMultiplier = 1 + (Math.abs(hitPoint) * 0.5); // Tăng tối đa 50% tốc độ

        // Đặt lại tốc độ và hướng của bóng
        ball.dy = -ball.speed * speedMultiplier;
        ball.dx = ball.speed * hitPoint * speedMultiplier;

        // Giới hạn tốc độ tối đa
        const maxSpeed = ball.speed * 2; // Tốc độ tối đa là gấp đôi tốc độ cơ bản
        const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (currentSpeed > maxSpeed) {
            const scale = maxSpeed / currentSpeed;
            ball.dx *= scale;
            ball.dy *= scale;
        }

        // Reset combo khi chạm paddle
        combo = 0;

        // Phát âm thanh
        playSound('bounce');
    }

    // Va chạm với tường - không ảnh hưởng đến combo
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }
}

// Cập nhật trạng thái game
function update() {
    if (gameOver) return;

    // Di chuyển paddle
    if (keys['ArrowLeft'] && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }
    if (keys['ArrowRight'] && paddle.x + paddle.width < canvas.width) {
        paddle.x += paddle.speed;
    }

    // Nếu bóng đang ở trên paddle
    if (ballOnPaddle) {
        ball.x = paddle.x + paddle.width/2;
        ball.y = paddle.y - ball.radius;
    } else {
        // Di chuyển bóng bình thường
        ball.x += ball.dx;
        ball.y += ball.dy;
    }

    // Kiểm tra va chạm
    collisionDetection();

    // Kiểm tra thua
    if (ball.y + ball.radius > canvas.height) {
        lives--;
        playSound('loseLife');
        combo = 0; // Reset combo khi mất bóng
        if (lives <= 0) {
            gameOver = true;
            // Dừng tất cả âm thanh khác trước khi phát game over
            Object.values(SOUNDS).forEach(sound => {
                sound.pause();
                sound.currentTime = 0;
            });
            playSound('gameOver');
        } else {
            ballOnPaddle = true;
            ball.dx = ball.speed;
            ball.dy = -ball.speed;
        }
    }

    // Cập nhật vị trí vật phẩm
    powerups.forEach((powerup, index) => {
        powerup.y += POWERUP_SPEED;
        // Xóa vật phẩm nếu rơi khỏi màn hình
        if (powerup.y > canvas.height) {
            powerups.splice(index, 1);
        }
    });

    // Kiểm tra hoàn thành level
    if (checkLevelComplete()) {
        if (currentLevel < MAX_LEVEL) {
            currentLevel++;
            playSound('levelUp');
            startNewLevel();
        } else {
            // Người chơi đã thắng tất cả các level
            gameOver = true;
            playSound('levelUp'); // Hoặc thêm âm thanh chiến thắng khác
        }
    }

    // Cập nhật các animation combo
    comboAnimations = comboAnimations.filter(anim => {
        anim.update();
        return !anim.isDead();
    });
}

// Sửa lại phần vẽ trái tim
function drawLives() {
    const heartSize = 30;
    const heartSpacing = 35;
    const startX = 10;
    const startY = 10;

    for (let i = 0; i < lives; i++) {
        ctx.save();

        // Vẽ glow cho trái tim
        ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
        ctx.shadowBlur = 15;

        // Vẽ trái tim với gradient
        const gradient = ctx.createRadialGradient(
            startX + (i * heartSpacing) + heartSize/2,
            startY + heartSize/2,
            heartSize/4,
            startX + (i * heartSpacing) + heartSize/2,
            startY + heartSize/2,
            heartSize
        );
        gradient.addColorStop(0, '#FF6B6B');
        gradient.addColorStop(0.5, '#FF0000');
        gradient.addColorStop(1, '#CC0000');

        ctx.fillStyle = gradient;

        // Vẽ hình trái tim
        const x = startX + (i * heartSpacing);
        const y = startY;
        const size = heartSize;

        ctx.beginPath();
        ctx.moveTo(x + size/2, y + size/4);
        ctx.bezierCurveTo(
            x + size/2, y,
            x + size, y,
            x + size, y + size/4
        );
        ctx.bezierCurveTo(
            x + size, y + size/2,
            x + size/2, y + size,
            x + size/2, y + size
        );
        ctx.bezierCurveTo(
            x + size/2, y + size,
            x, y + size/2,
            x, y + size/4
        );
        ctx.bezierCurveTo(
            x, y,
            x + size/2, y,
            x + size/2, y + size/4
        );
        ctx.fill();

        // Thêm hiệu ứng bóng sáng
        const highlight = ctx.createRadialGradient(
            x + size/3,
            y + size/3,
            size/10,
            x + size/3,
            y + size/3,
            size/3
        );
        highlight.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = highlight;
        ctx.fill();

        ctx.restore();
    }
}

// Thêm biến high score
let highScore = 0;

// Sửa lại hàm draw để bỏ phần vẽ điểm và level trong canvas
function draw() {
    // Xóa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ background
    ctx.drawImage(SPRITES.background, 0, 0, canvas.width, canvas.height);

    if (gameOver) {
        // Làm tối background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Vẽ khung chứa thông tin
        const boxWidth = 500; // Tăng kích thước khung
        const boxHeight = 350;
        const boxX = (canvas.width - boxWidth) / 2;
        const boxY = (canvas.height - boxHeight) / 2;

        // Vẽ khung với viền phát sáng
        ctx.shadowColor = currentLevel > MAX_LEVEL ? '#FFD700' : '#4DA6FF';
        ctx.shadowBlur = 20;
        ctx.fillStyle = 'rgba(0, 20, 40, 0.9)';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        ctx.shadowBlur = 0;

        // Vẽ tiêu đề
        if (currentLevel > MAX_LEVEL) {
            // Hiệu ứng phát sáng cho title chiến thắng
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 25;
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 48px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('CONGRATULATIONS!', canvas.width/2, boxY + 80);

            // Thêm thông báo chinh phục game
            ctx.font = 'bold 24px "Press Start 2P"';
            ctx.fillStyle = '#FFA500';
            ctx.fillText('You have conquered', canvas.width/2, boxY + 130);
            ctx.fillText('all 15 levels!', canvas.width/2, boxY + 170);
        } else {
            ctx.fillStyle = '#FF0000';
            ctx.font = 'bold 48px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width/2, boxY + 80);
        }

        // Vẽ điểm số
        ctx.shadowBlur = 0;
        ctx.font = 'bold 24px "Press Start 2P"';

        // Score
        ctx.fillStyle = '#4DA6FF';
        ctx.textAlign = 'right';
        ctx.fillText('Score:', canvas.width/2 - 20, boxY + 220);
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'left';
        ctx.fillText(score, canvas.width/2 + 20, boxY + 220);

        // High Score với hiệu ứng phát sáng nếu là high score mới
        if (score >= highScore) {
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15;
        }
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'right';
        ctx.fillText('Best:', canvas.width/2 - 20, boxY + 260);
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'left';
        ctx.fillText(highScore, canvas.width/2 + 20, boxY + 260);
        ctx.shadowBlur = 0;

        // Vẽ hướng dẫn chơi lại
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '20px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to play again', canvas.width/2, boxY + boxHeight - 40);

        return;
    }

    // Vẽ paddle
    ctx.drawImage(SPRITES.paddle, paddle.x, paddle.y, paddle.width, paddle.height);

    // Vẽ bóng
    ctx.drawImage(SPRITES.ball,
        ball.x - ball.radius,
        ball.y - ball.radius,
        ball.radius * 2,
        ball.radius * 2
    );

    // Vẽ gạch
    for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
            const brick = bricks[row][col];
            if (brick.visible) {
                let brickSprite;
                if (brick.strength === Infinity) {
                    brickSprite = SPRITES.bricks.metal;
                } else {
                    switch(brick.strength) {
                        case 4: brickSprite = SPRITES.bricks.red; break;
                        case 3: brickSprite = SPRITES.bricks.orange; break;
                        case 2: brickSprite = SPRITES.bricks.yellow; break;
                        case 1: brickSprite = SPRITES.bricks.green; break;
                    }
                }
                ctx.drawImage(brickSprite, brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
            }
        }
    }

    // Vẽ mạng (trái tim)
    drawLives();

    // Thêm hướng dẫn khi bóng đang ở trên paddle
    if (ballOnPaddle && !gameOver) {
        ctx.fillStyle = '#FFF';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Nhấn SPACE để bắt đầu', canvas.width/2, canvas.height - 50);
    }

    // Vẽ vật phẩm
    powerups.forEach(powerup => {
        ctx.fillStyle = powerup.type.color;
        ctx.fillRect(powerup.x, powerup.y, POWERUP_SIZE, POWERUP_SIZE);
        ctx.fillStyle = '#FFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(powerup.type.symbol,
            powerup.x + POWERUP_SIZE/2,
            powerup.y + POWERUP_SIZE/2 + 4);
    });

    // Cập nhật hiển thị điểm và level bên ngoài
    document.getElementById('scoreDisplay').textContent = score;
    document.getElementById('levelDisplay').textContent = currentLevel;
    document.getElementById('highScoreDisplay').textContent = highScore;

    // Vẽ các animation combo
    comboAnimations.forEach(anim => anim.draw(ctx));

    // Hiển thị combo hiện tại
    if (combo > 1) {
        // Hiệu ứng glow
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 15;

        // Vẽ combo counter
        ctx.font = 'bold 24px "Press Start 2P"';
        ctx.textAlign = 'left';

        // Vẽ outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(`COMBO ×${combo}`, 10, 90);

        // Vẽ text với gradient
        const gradient = ctx.createLinearGradient(10, 70, 10, 90);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(1, '#FFA500');
        ctx.fillStyle = gradient;
        ctx.fillText(`COMBO ×${combo}`, 10, 90);

        // Hiển thị điểm tiếp theo
        ctx.font = '16px "Press Start 2P"';
        ctx.fillStyle = '#FFF';
        ctx.shadowBlur = 10;
        ctx.fillText(`NEXT: +${BASE_BRICK_SCORE + (combo * COMBO_BONUS)}`, 10, 110);

        // Reset shadow
        ctx.shadowBlur = 0;
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Thêm function reset game
function resetGame() {
    lives = INITIAL_LIVES;  // Sử dụng INITIAL_LIVES thay vì số cứng 5
    gameOver = false;
    currentLevel = 1;
    score = 0;
    combo = 0;
    startNewLevel();
}

// Sửa lại phần xử lý phím
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (gameOver) {
            // Dừng âm thanh game over nếu đang phát
            SOUNDS.gameOver.pause();
            SOUNDS.gameOver.currentTime = 0;
            resetGame();
        } else if (ballOnPaddle) {
            // Thả bóng khi nhấn Space
            ballOnPaddle = false;
            ball.dx = ball.speed * (Math.random() * 2 - 1); // Random hướng trái/phải
            ball.dy = -ball.speed;
        }
    }
    keys[e.key] = true;
});

// Đảm bảo hình ảnh tim được tải trước khi bắt đầu game
Promise.all([
    new Promise(resolve => SPRITES.background.onload = resolve),
    new Promise(resolve => SPRITES.ball.onload = resolve),
    new Promise(resolve => SPRITES.paddle.onload = resolve),
    new Promise(resolve => SPRITES.bricks.metal.onload = resolve),
    new Promise(resolve => SPRITES.bricks.red.onload = resolve),
    new Promise(resolve => SPRITES.bricks.orange.onload = resolve),
    new Promise(resolve => SPRITES.bricks.yellow.onload = resolve),
    new Promise(resolve => SPRITES.bricks.green.onload = resolve),
    new Promise(resolve => SPRITES.heart.onload = resolve)
]).then(() => {
    initGame();
});

// Thêm hàm bắt đầu level mới
function startNewLevel() {
    ballOnPaddle = true;
    paddle.x = canvas.width / 2 - PADDLE_WIDTH / 2;
    ball.x = paddle.x + paddle.width/2;
    ball.y = paddle.y - ball.radius;
    ball.dx = ball.speed;
    ball.dy = -ball.speed;
    powerups = [];
    combo = 0; // Reset combo khi bắt đầu level mới
    bricks = createBricksForLevel(currentLevel);
}

// Thêm vào cuối file
function initGame() {
    lives = INITIAL_LIVES;  // Thêm dòng này để đảm bảo số mạng đúng khi khởi động
    bricks = createBricksForLevel(currentLevel);
    gameLoop();
}

// Gọi startNewLevel khi bắt đầu game mới
startNewLevel();

// Sửa lại hàm tính điểm
function addScore(baseScore) {
    const now = Date.now();
    if (now - lastBrickTime < COMBO_TIMEOUT) {
        combo++;
    } else {
        combo = 0;
    }
    score += baseScore;

    // Cập nhật và lưu high score nếu score mới cao hơn
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('breakoutHighScore', highScore.toString());
    }

    lastBrickTime = now;
}
