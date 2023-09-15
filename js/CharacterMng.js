import Player from "./Player.js";
import MainScene from "./MainScene.js";
import Monster from "./Monster.js";

export default class CharacterMng extends Phaser.GameObjects.GameObject {
    constructor(data){
        let { scene} = data;
        super(scene);
        this.scene.add.existing(this);

        this.mainScene = scene; // MainScene.js의 인스턴스를 저장합니다.
        this.isSoundPlaying = this.scene.isSoundPlaying;;
    }

    init(message){
        if(message == 100)
        {
            this.isSoundPlaying= false;
        }
        else
        {
            this.isSoundPlaying= true;
        }
    }
    static preload(scene)
    {
        this.scene = scene;

        // pink
        scene.load.atlas(
            "pink",
            "assets/images/pink.png",
            "assets/images/pink_atlas.json"
        );
        scene.load.animation('pink_anim', 'assets/images/pink_anim.json');

        // penguin
        scene.load.atlas(
            "penguin",
            "assets/images/penguin.png",
            "assets/images/penguin_atlas.json"
        );
        scene.load.animation('penguin_anim', 'assets/images/penguin_anim.json');

        // penguin_die
        scene.load.atlas(
            "die",
            "assets/images/die.png",
            "assets/images/die_atlas.json"
        );
        scene.load.animation('die_anim', 'assets/images/die_anim.json');

        //게임오버
        scene.load.atlas(
            "gameover",
            "assets/images/gameover.png",
            "assets/images/gameover_atlas.json"
        );
        scene.load.animation('gameover_anim', 'assets/images/gameover_anim.json');

    }
    update()
    {
        this.handleClickChange();
    }
    async Gameover(){
        this.scene.isGameOver = true;
        //게임오버 이미지와 애니
        this.gameover = this.scene.add.sprite(360, 230, "gameover").setDepth(4);
        this.gameover.anims.play("gameover_idle", true).setDepth(4);

        // 게임오버 음악 재생 
        if(this.isSoundPlaying)
        {
            this.gameOver = this.mainScene.sound.add("gameOver");
            this.gameOver.play();
        }

        // 플레이어 애니메이션 die로 변경
        this.player.anims.play("die_idle", true);

        //데이터 날짜형식으로 정의해줌
        let data = {
            date: new Date()
        }
        // 한국 표준시 (KST) 기준으로 변환
        let koreanTime = new Date(data.date.getTime() + (9 * 60 * 60 * 1000));
        let formattedDateTime = koreanTime.toISOString().slice(0, 19).replace('T', ' ');

        // UPDATE
        try {
            const formData = new FormData();
            formData.append('pk', LOG_GAMEDATA_PK);
            formData.append('column', 'GAMEDATA_END_DT');
            formData.append('value', formattedDateTime);

            const response = await fetch('../07-red-zone/DBphp/update-column.php', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error:', error);
        }

        // 클릭 이벤트 잠금 설정
        this.scene.input.enabled = false;

        // 1.8초 후에 다른 씬으로 전환하기 위해 타이머 설정
        this.scene.time.delayedCall(1500, this.GameoverChangeScene, [], this);

    }
    async GameoverChangeScene(){
        // 사운드
        if (this.scene.isSoundPlaying) {
            this.scene.sound.stopAll();
        }
        // 점수 데이터 넘기기
        let data = {
            score : this.scene.score,
        }
        // UPDATE
        try {
            const formData = new FormData();
            formData.append('pk', LOG_GAMEDATA_PK);
            formData.append('column', 'GAMEDATA_POINT');
            formData.append('value', data.score);

            const response = await fetch('../07-red-zone/DBphp/update-column.php', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error:', error);
        }

        // 씬 전환
        this.scene.scene.start("ranking", data);

    }
    // -----------------------벽 충돌-----------------------------------------------------
    CollisionBox(){
        // 충돌 체크
        this.scene.matter.world.on('collisionstart', (event, bodyA, bodyB) => {
            if ((bodyA.label === 'playerCollider' && bodyB.label === 'CollisionBox') ||
                (bodyA.label === 'CollisionBox' && bodyB.label === 'playerCollider')||
                (bodyA.label === 'MonsterCollision' && bodyB.label === 'playerCollider') ||
                (bodyA.label === 'playerCollider' && bodyB.label === 'MonsterCollision') &&
                !this.scene.isGameOver) {

                console.log("게임오버");
                this.Gameover();
            }
        });
    }
    MonsterCollision() {
        // 객체 간의 충돌 처리
        this.scene.matter.world.on('collisionstart', (event) => {
            const pairs = event.pairs;

            for (const pair of pairs) {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;
                    if ((bodyA.label === 'MonsterCollision' && bodyB.label === 'CollisionBox')) {
                        // 충돌 후 몬스터 위치 조정
                        this.adjustMonsterPosition(bodyA.gameObject, bodyB.gameObject.x, bodyB.gameObject.y, bodyB.gameObject.label);
                    }
            }
        });
    }
    adjustMonsterPosition(monster, CollisionBox_X, CollisionBox_Y, coldirection) {
        const monsterX = CollisionBox_X - monster.x;
        const monsterY = CollisionBox_Y - monster.y;
        const directionX = monsterX;
        const directionY = monsterY;

        // 방향 벡터의 길이 계산
        const length = Math.sqrt(directionX * directionX + directionY * directionY);

        // 방향 벡터를 단위 벡터로 정규화
        const normalizedDirectionX = directionX / length;
        const normalizedDirectionY = directionY / length;

        // 몬스터의 방향을 업데이트하여 방향을 꺾음
        if (coldirection == "Up" || coldirection == "Down") {
            monster.direction = Math.atan2(-normalizedDirectionY, normalizedDirectionX);
        } else if (coldirection == "Left" || coldirection == "Right") {
            monster.direction = Math.atan2(normalizedDirectionY, -normalizedDirectionX);
        }

    }
    handleClickChange() {
        if (this.player.isClickedOnce) {
        // isClickedOnce가 true로 변경되었을 때 실행할 코드
            this.moveMonsterRandomly(this.monster1);
            this.moveMonsterRandomly(this.monster2);
            this.moveMonsterRandomly(this.monster3);
            this.moveMonsterRandomly(this.monster4);
        }
    }
    moveMonsterRandomly(monster) {
        let speed = 5 + (this.scene.score * 0.2);

        const velocityX = Math.cos(monster.direction) * speed ;
        const velocityY = Math.sin(monster.direction) * speed ;

        // 몬스터에게 새로운 속도 적용
        monster.setVelocity(velocityX, velocityY)
    }
    
    createPlayer()
    {
        this.player = new Player({
            scene: this.scene,
            x: 360,
            y: 550,
            texture: "penguin",
            frame: "penguin01",
        });
    }
    createMonsters() {
        // 몬스터 4개 생성 및 초기화
        this.monster1 = new Monster({
            scene: this.scene,
            x: 180,
            y: 260,
            texture: "pink",
            frame: "pink01",
        });
        this.monster1.direction = Math.random() * Math.PI * 2;
        
        this.monster2 = new Monster({
            scene: this.scene,
            x: 540,
            y: 260,
            texture: "pink",
            frame: "pink01",
        });
        this.monster2.direction = Math.random() * Math.PI * 2;

        this.monster3 = new Monster({
            scene: this.scene,
            x: 180,
            y: 870,
            texture: "pink",
            frame: "pink01",
        });
        this.monster3.direction = Math.random() * Math.PI * 2;

        this.monster4 = new Monster({
            scene: this.scene,
            x: 540,
            y: 870,
            texture: "pink",
            frame: "pink01",
        });
        this.monster4.direction = Math.random() * Math.PI * 2;
    }
    
    Init()
    {
        this.createPlayer();
        this.createMonsters();
        this.CollisionBox();
        this.MonsterCollision();

        this.player.anims.play("penguin_idle", true).setDepth(2); //애니메이션 재생
        this.monster1.anims.play("pink_idle", true); //애니메이션 재생
        this.monster2.anims.play("pink_idle", true); //애니메이션 재생
        this.monster3.anims.play("pink_idle", true); //애니메이션 재생
        this.monster4.anims.play("pink_idle", true); //애니메이션 재생
    }

    
}