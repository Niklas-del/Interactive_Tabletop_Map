from sqlalchemy.orm import Session

from . import models


def seed_database(db: Session) -> None:
    if db.query(models.Character).count() == 0:
        db.add(
            models.Character(
                name="Aria Dawn",
                description="A cautious scout from the Ashen Border.",
                archetype="Ranger",
                appearance="hooded",
                level=2,
                health=14,
                max_health=14,
                strength=6,
                agility=8,
                intelligence=5,
                equipment_json='{"weapon":"Shortbow","armor":"Leather Coat","trinket":"Compass"}',
            )
        )

    if db.query(models.Room).count() == 0:
        db.add(
            models.Room(
                name="Wayfarer Inn",
                description="A warm tavern room with heavy stone walls.",
                width=16,
                height=12,
                layout_json='{"objects":[{"id":"w1","type":"wall","x":0,"y":0,"properties":{"edge":"north"}},{"id":"f1","type":"furniture","x":6,"y":5,"properties":{"kind":"table"}},{"id":"o1","type":"obstacle","x":8,"y":7,"properties":{"kind":"crate"}}]}',
            )
        )

    db.commit()
