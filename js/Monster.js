export default class Monster extends Phaser.Physics.Matter.Sprite {

    constructor(data){
        let { scene, x, y,  texture, frame } = data;
        super(scene.matter.world, x, y, texture, frame );
        this.scene.add.existing(this);

        // 충돌 박스 생성
        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        var MonsterCollision = Bodies.circle(this.x, this.y, 56, {
            isSensor: true, 
            label: "MonsterCollision",
            isStatic: true,
        });

        const compoundBody = Body.create({
            parts: [MonsterCollision],
            frictionAir: 0.35
        });
        this.setExistingBody(compoundBody);
        this.setFixedRotation(true); //충돌해도 안돌아가게
    }

}