import {
    world,
    system,
    ItemStack
} from "@minecraft/server";

function isGlass(blockId) {

    return (
        blockId === "minecraft:glass" ||
        blockId === "minecraft:glass_pane" ||
        blockId.endsWith("_stained_glass") ||
        blockId.endsWith("_stained_glass_pane")
    );
}

world.afterEvents.playerSwingStart.subscribe((event) => {

    const player = event.player;

    const item =
        player
            .getComponent("minecraft:equippable")
            ?.getEquipment("Mainhand");

    if (!item) {
        return;
    }

    if (!item.typeId.endsWith("_pickaxe")) {
        return;
    }

    const hit =
        player.getBlockFromViewDirection({
            maxDistance: 6
        });

    if (!hit) {
        return;
    }

    const block = hit.block;

    if (!block) {
        return;
    }

    const blockId = block.typeId;

    if (!isGlass(blockId)) {
        return;
    }

    let silkTouch = false;

    try {

        const enchantable =
            item.getComponent(
                "minecraft:enchantable"
            );

        silkTouch =
            enchantable?.getEnchantment(
                "silk_touch"
            ) !== undefined;

    } catch {}

    const loc = {
        x: block.location.x,
        y: block.location.y,
        z: block.location.z
    };

    system.run(() => {

        player.dimension.runCommand(
            `setblock ${loc.x} ${loc.y} ${loc.z} air`
        );

        if (silkTouch) {

            player.dimension.spawnItem(
                new ItemStack(
                    blockId,
                    1
                ),
                {
                    x: loc.x + 0.5,
                    y: loc.y + 0.5,
                    z: loc.z + 0.5
                }
            );
        }
    });
});