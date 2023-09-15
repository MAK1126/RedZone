
export default class Player extends Phaser.Physics.Matter.Sprite {

    constructor(data){
        let { scene, x, y, texture, frame } = data;
        super(scene.matter.world, x, y, texture, frame);
        this.scene.add.existing(this);

        // 충돌 설정
        const { Body, Bodies } = Phaser.Physics.Matter.Matter;

        // 플레이어를 움직일 마우스 드래그 관련 변수
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        var playerCollider = Bodies.circle(this.x, this.y, 56,{
            isSensor: true, 
            label: "playerCollider",
            isStatic: true,
        });

        // 디버그 랜더러 비활성화
        playerCollider.render.visible = false;
        this.scene.matter.world.drawDebug = false;

        const compoundBody = Body.create({
            parts: [playerCollider],
            frictionAir: 0.35
        });
        this.setExistingBody(compoundBody);
        this.setFixedRotation(true); //충돌해도 안돌아가게

        this.mainScene = scene;

        this.isSoundPlaying = false;

        // 플레이어 스프라이트에 클릭 이벤트 리스너 추가
        this.setInteractive();
        this.on("pointerdown", this.onPlayerClick, this);

        // 마우스 이벤트 리스너 추가
        this.scene.input.on("pointerup", this.onPointerUp, this);
        this.scene.input.on("pointermove", this.onPointerMove, this);
        this.isClickedOnce = false;
    }

    onPlayerClick(pointer) {

        if(!this.isClickedOnce && !this.scene.isGameOver)
        {
            //1초마다 점수를 증가시키는 타이머 설정
            const scoreIncreaseTimer = this.scene.time.addEvent({
                delay: 1000, // 1초 (1000 밀리초)
                callback: () => {
                    this.scene.score += 1;   // 1점 증가
                    this.scene.scoreText.setText(`${this.scene.score}`); // 텍스트 업데이트
                },
                loop: true, // 타이머를 반복 실행
            });
        }

        if (pointer.leftButtonDown()) {
            // 마우스 왼쪽 버튼을 플레이어 스프라이트 위에서 클릭했을 때
            const { worldX, worldY } = pointer;
            // 마우스와 플레이어 사이의 거리를 계산하여 드래그 오프셋 설정
            this.dragOffsetX = this.x - worldX;
            this.dragOffsetY = this.y - worldY;
            this.isDragging = true;
            this.isClickedOnce = true;
        }
    }

    onPointerUp(pointer) {
        if (pointer.leftButtonReleased()) {
            // 마우스 왼쪽 버튼이 놓였을 때
            this.isDragging = false;
        }
    }

    onPointerMove(pointer) {
        if (this.isDragging) {
            // 마우스 드래그 중일 때
            const { worldX, worldY } = pointer;
            // 드래그 중인 경우 플레이어 위치 업데이트
            this.setPosition(worldX + this.dragOffsetX, worldY + this.dragOffsetY);
        }
    }

    static preload(scene){}

    create(){}

    update(){}

}