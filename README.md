<h1>#!/Shabang | Condution</h1>

<a href=""><img src="https://img.shields.io/badge/Maintenance%20Level-Actively%20Developed-brightgreen.svg"/> </a>
<a href="https://github.com/Shabang-Systems/Condution/releases/"><img src="https://img.shields.io/github/package-json/v/shabang-systems/condution"/> </a>
<a href="https://github.com/Shabang-Systems/Condution/releases/"><img src="https://img.shields.io/github/downloads/shabang-systems/condution/total"/> </a>
<a href=""><img src="https://img.shields.io/github/license/shabang-systems/condution"/> </a>

<div style="display: flex; align-items: center; width: 100%">
<a href="https://www.producthunt.com/posts/condution?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-condution" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=285358&theme=light" alt="Condution - Open-source, cross-platform task management + collaboration | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
<a href="https://play.google.com/store/apps/details?id=cf.shabang.condution" target="_blank" style="transform: translateY(-10px)"><img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Condution - Open-source, cross-platform task management + collaboration" style="width: auto; height: 65px; transform: translateY(-20px)" height="65" /></a>
<a href="https://apps.apple.com/us/app/condution/id1523249900" target="_blank"><img src="https://developer.apple.com/news/images/download-on-the-app-store-badge.png" alt="Condution - Open-source, cross-platform task management + collaboration" style="width: auto; height: 54px;" height="54" /></a>
</div>



**This. Is. Condution.** A project management system that makes sense and will not burn your pockets out.

***

## Those Download Buttons?
👉 [**Direct Download**](https://www.condution.com/#downloads) the latest version of Condution here! 👈 

Also, here's the [App Store](https://apps.apple.com/us/app/condution/id1523249900) & [Play Store](https://play.google.com/store/apps/details?id=cf.shabang.condution) links for y'all phone nerds out there.

## The App
Condution is a wonderful electron app built to create a perfectly easy task-management dashboard that's powerful, yet also simple. The inspiration of the project spanned from our long frustration with the current state of productivity software on the internet — they are expensive and often complicated to use.

Condution attempts to change this. We want to create an open-source productivity/task-management app that is both simple, and, well, free (but we do take [Patreon](https://www.patreon.com/condution) donations though).

<p align="center">
  <img src="https://www.condution.com/app.png" />
  <i>This. Is. (Actually.) Condution.</i>
</p>

### Features 
Condution is a powerful yet incredibly simple check-list application that supports your needs from study, to business, and to life. Bring Condution with you across the globe and let it be your second brain — so you can focus on living your best life.

#### Your Favorite Task-List
Create tasks, manage them in projects, add some tags, set due dates, and repeat them at will. Condution has the whole nine-yards of the core list-making features nailed so you could create and edit anything from grocery lists to hundred-task projects.

#### Filters and Perspectives
Filter tasks by tag? Check. Filter by projects? Check. Filter by due date? Check. Filter by due date and project with tags and sort tasks based on defer date while hiding everything that's not availale? You bet.

#### Collaborative Workspaces
create and share "workspaces" by tapping on the "personal workspace" badge found on the upcoming view. These workspaces are collaborative Condution views in which everyone — regardless if they have an account — could collaborate on Condution!

#### Tag Weights
Tags are weighted! You could now set a tag to be more "heavy" than others (say.. High Energy with a weight of 10, Low Energy with a weight of 0.5), and these weight values will reflect across various parts of the interface (including a "loading bar" on projects) to give you an intuitive view of how "hard" something will be.

#### Due + Start Dates (and Times!)
Yes, you heard it right! Unlike some of the other apps out there, we know that timing is important to people! Every task is hidden until a certain *time* and due at precisely at a *time*, so your know day could be managed right down to your needs.

#### Sequential and Parallel Projects!
Some tasks can't really be done without others before it being done first, and we understand that. Tasks blocked in a sequential project could be hidden if needed, and shown again when ready.

## The Team
We are Shabang, a software development company aiming to design innovative solutions for interesting issues with fun and creative products.

We happen also to be a group of students from the silicon valley wanting to make this world slightly better with technology.

## Developing n' Building
Thanks for developing with us! Our preferred package manager is [yarn](https://yarnpkg.com/). If you don't know what that is, teach yourself the ways of the [Soydev](https://www.urbandictionary.com/define.php?term=Soydev).

We assume here that you have `node` 12+ installed. If you don't, [do it](https://nodejs.org/en/). When we use `$ROOT` in these docs, we mean the root of the repository.

### First, a quick note on cloning.

Begin by cloning the project at [https://github.com/Shabang-Systems/Condution](https://github.com/Shabang-Systems/Condution). 

The default branch should be the main development branch, and the branch `master` is the currently released version.

**This package has submodules! When you clone, make sure to clone submodules along with it by either `git clone --recursive` or, after you clone, `git submodule init` then `git submodule update`.**

### Firebase Connection

After cloning the package (with Submodules!), you need to add a lovely file into `$ROOT/src/backend/` called `secrets.json`. It contains your Firebase key objects (to power the Engine), which you need to gather following [these instructions](https://firebase.google.com/docs/web/setup#config-object). Here's an example `secrets.json`:

```jsx
{
    "dbkeys": {
        "deploy": {
            "apiKey": "...",
            "authDomain": "...",
            ...
            "appId": "..."
        },
        "debug": {
            "apiKey": "...",
            "authDomain": "...",
            ...
            "appId": "..."
        }
    }
}
```

We use two different Firebase projects for debug and deploy respectively. If you are only debugging, no need to include a different set of keys for deploy.

### The Yarn CLI

`secrets.json` in, you are ready to Conduct (verb: to write Condution)! Get all of the necessary project dependencies by issuing the command `yarn` in `$ROOT`. Just `yarn`.

You probably also need the Ionic CLI tools, which you could install by running `npm install -g @ionic/cli`.

With everything installed, execute your favourite CLI command to get started!

```markdown
`yarn` \
   `ionic:dist` — builds optimized web version/build folder
   `ionic:runios` — runs the dev server + ios hooks
   `ionic:rundroid` — runs the dev server + android hooks
   `electron:run` — runs electrn hooks only. you need to start the dev server with any of :point_up_2:
```

The actual build command has not been written yet for v1.0, but it's probably going to be `yarn platform:build` or something to that effect.

Good luck! Let us know if you have any questions [on the Discord](https://discord.gg/3hS7yv3) or [in the issues](https://github.com/Shabang-Systems/Condution/issues).

## Contributing?
We love contributions! You are welcome to contribute, just keep in mind that we prefer 4 spaces over tabs.

## Thank you!
Thank you for supporting us on this project. We want to give a special shout out to the parteons that have supported us. 
Thanks to Greirson, cyberic, and Reidel Law Firm for their support

We could not be here without this community, your insightful feedback, and the support of our generous [Patrons](https://www.patreon.com/condution). Thank you for using our application, sticking with us, and supporting us along the way.

***

Designed with :heart: and :green_salad: by #!/Shabang.
